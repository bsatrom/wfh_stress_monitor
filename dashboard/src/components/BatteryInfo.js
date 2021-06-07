import React from "react";
import {
  Card,
  CardTitle,
  CardBody
} from "shards-react";
import { BatteryFull, BatteryHalf, Battery } from 'react-bootstrap-icons';

function BatteryImage(props) {
  const batteryLevel = props.battery;
  if (batteryLevel > 60) {
    return <BatteryFull size={40} />;
  } else if (batteryLevel > 30) {
    return <BatteryHalf size={40} />;
  } else {
    return <Battery size={40} />;
  }
}

export default function BatteryInfo(props) {
  return (
    <Card className="dashboard-card" style={{ maxWidth: "300px", maxHeight: "150px" }}>
      <CardBody>
        <CardTitle>Battery Charge</CardTitle>
        <h3>
          {props.battery}% <BatteryImage battery={props.battery} />
        </h3>
      </CardBody>
    </Card>
  );
}
