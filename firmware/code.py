import time
import array
import math
import board
import audiobusio

import adafruit_bmp280
import adafruit_sht31d
import notecard

import adafruit_ble
from adafruit_ble.advertising.standard import ProvideServicesAdvertisement
from adafruit_ble.services.standard.device_info import DeviceInfoService
from adafruit_ble.services.standard import BatteryService
from adafruit_ble_heart_rate import HeartRateService

from digitalio import DigitalInOut, Direction

# Feather on-board status LEDs setup
red_led = DigitalInOut(board.RED_LED)
red_led.direction = Direction.OUTPUT
red_led.value = True

blue_led = DigitalInOut(board.BLUE_LED)
blue_led.direction = Direction.OUTPUT
blue_led.value = False

productUID = "com.blues.bsatrom:wfh_stress_detector"

i2c = board.I2C()

card = notecard.OpenI2C(i2c, 0, 0, debug=True)

bmp280 = adafruit_bmp280.Adafruit_BMP280_I2C(i2c)
sht31d = adafruit_sht31d.SHT31D(i2c)
microphone = audiobusio.PDMIn(
    board.MICROPHONE_CLOCK, board.MICROPHONE_DATA, sample_rate=16000, bit_depth=16
)

# Set this to sea level pressure in hectoPascals at your location for accurate altitude reading.
bmp280.sea_level_pressure = 1013.25

ble = adafruit_ble.BLERadio()

# Local Functions
def normalized_rms(values):
    minbuf = int(sum(values) / len(values))
    return int(
        math.sqrt(
            sum(float(sample - minbuf) * (sample - minbuf) for sample in values)
            / len(values)
        )
    )


def get_heart_rate_data(hr_connection, notify_hr):
    heart_rate = {}

    print("Scanning for Heart Rate Service...")
    red_led.value = True
    blue_led.value = False
    time.sleep(1)

    for adv in ble.start_scan(ProvideServicesAdvertisement, timeout=5):
        if HeartRateService in adv.services:
            print("found a HeartRateService advertisement")
            hr_connection = ble.connect(adv)
            time.sleep(2)
            print("Connected to service")
            blue_led.value = True
            red_led.value = False
            break

    # Stop scanning whether or not we are connected.
    ble.stop_scan()
    print("Stopped BLE scan")
    red_led.value = False
    blue_led.value = True

    if hr_connection and hr_connection.connected:
        print("Fetch HR connection")
        if DeviceInfoService in hr_connection:
            dis = hr_connection[DeviceInfoService]
            try:
                manufacturer = dis.manufacturer
            except AttributeError:
                manufacturer = "(Manufacturer Not specified)"
            try:
                model_number = dis.model_number
            except AttributeError:
                model_number = "(Model number not specified)"
            heart_rate["manufacturer"] = manufacturer.replace("\u0000", "")
            heart_rate["model_number"] = model_number
        else:
            print("No device information")

        if BatteryService in hr_connection:
            batt_svc = hr_connection[BatteryService]
            batt = batt_svc.level
            heart_rate["battery_level"] = batt

        hr_service = hr_connection[HeartRateService]

        while hr_connection.connected:
            values = hr_service.measurement_values
            if values:
                bpm = values.heart_rate
                if bpm is not 0:
                    pct_notify = round(100 * (bpm / notify_hr))
                if values.heart_rate is 0:
                    print("Heart Rate not found...")
                    break
                else:
                    heart_rate["bpm"] = bpm
                    heart_rate["pct_notify"] = pct_notify
                    break
    return heart_rate, hr_connection


def set_default_env_var(name, default):
    req = {"req": "env.default"}
    req["name"] = name
    req["text"] = str(default)
    card.Transaction(req)


def get_env_var(name):
    req = {"req": "env.get"}
    req["name"] = name
    rsp = card.Transaction(req)
    if "text" in rsp:
        return rsp["text"]
    else:
        return 0


def send_notification(message):
    req = {"req": "note.add"}
    req["file"] = "sensor_alert.qo"
    req["sync"] = True
    req["body"] = {
        "message": message
    }
    card.Transaction(req)


def main():
    hr_connection = None

    # Set-up local notification thresholds
    notify_hr = 80
    notify_batt = 30
    notify_sound = 50

    # Configure Notecard connection and sync behavior
    req = {"req": "hub.set"}
    req["product"] = productUID
    req["mode"] = "continuous"
    req["align"] = True
    req["sync"] = True
    req["inbound"] = 120
    req["outbound"] = 5
    card.Transaction(req)

    # Set Env Var Defaults
    set_default_env_var("notify_batt", notify_batt)
    set_default_env_var("notify_hr", notify_hr)
    set_default_env_var("sound_max", notify_sound)

    # Disconnect if connected
    if ble.connected:
        for connection in ble.connections:
            if HeartRateService in connection:
                connection.disconnect()
            break

    while True:
        samples = array.array("H", [0] * 160)
        microphone.record(samples, len(samples))
        sound_level = normalized_rms(samples)

        notify_hr = int(get_env_var("notify_hr"))
        notify_batt = int(get_env_var("notify_batt"))
        sound_max = int(get_env_var("sound_max"))

        heart_rate, hr_connection = get_heart_rate_data(hr_connection, notify_hr)

        print("\nReadings")
        print("---------------------------------------------")
        print("Temperature: {:.1f} C".format(bmp280.temperature))
        print("Barometric pressure:", bmp280.pressure)
        print("Humidity: {:.1f} %".format(sht31d.relative_humidity))
        print("Sound level:", sound_level)
        if heart_rate:
            print("Heart Rate: ", heart_rate["bpm"])
            print("% of Ceiling Rage: ", heart_rate["pct_notify"])
        print("---------------------------------------------\n")

        if heart_rate:
            if heart_rate["bpm"] > notify_hr:
                send_notification("Your heart rate is high. Take a few deep breaths, buddy.")

            if heart_rate["battery_level"] < notify_batt:
                send_notification("Monitor battery is low. Give it a charge, and maybe take a break.")

            if sound_level > sound_max:
                send_notification("It's pretty loud in there. Maybe stop yelling and you'll feel better.")

            req = {"req": "note.add"}
            req["file"] = "sensors.qo"
            req["body"] = {
                "temp": bmp280.temperature,
                "humidity": sht31d.relative_humidity,
                "pressure": bmp280.pressure,
                "sound_level": sound_level,
                "heart_rate": heart_rate,
            }
            card.Transaction(req)

        time.sleep(15)


main()
