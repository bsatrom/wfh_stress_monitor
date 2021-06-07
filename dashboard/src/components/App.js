import React, { Component } from 'react';
import TopNav from './TopNav';
import {
  Alert,
  Container,
  Row,
  Col,
  Badge
} from "shards-react";
import LineChart from './LineChart';
import BatteryInfo from './BatteryInfo';
import HeartRateInfo from './HeartRateInfo';
import TempInfo from './TempInfo';
import SoundInfo from './SoundInfo';
import axios from 'axios';

import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css"
import '../styles/App.css';

const HEALTH_DATA_API = process.env.REACT_APP_HEALTH_DATA_URL;
const ALERTS_API = process.env.REACT_APP_ALERTS_URL;
const ENV_VARS_API = process.env.REACT_APP_ENV_VARS_URL;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      device: null,
      model: null,
      readings: [],
      alerts:[],
      env_vars:[],
      currentBattery: null,
      currentHeartRate: null,
      currentTemp: null,
      currentSoundLevel: null,
      lastAlertCheck: null,
      isLoading: false,
      lastReading: null,
      alertMessage: null,
      error: null,
    };
  }

  async getHealthData() {
    this.setState({ isLoading: true });

    try {
      const result = await axios.get(HEALTH_DATA_API);
      const healthData = result.data;
      const latest = healthData.readings[0];

      this.setState({
        device: healthData.device,
        model: healthData.model,
        readings: healthData.readings,
        currentBattery: latest.batt,
        currentHeartRate: latest.bpm,
        currentSoundLevel: latest.sound_level,
        currentTemp: latest.temp,
        lastReading: latest.created,
        isLoading: false
      });
    } catch (error) {
      this.setState({
        error,
        isLoading: false
      });
    }
  }

  async getAlerts() {
    this.setState({ isLoading: true });

    try {
      const alertsResult = await axios.get(`${ALERTS_API}&since=${this.state.lastAlertCheck}`);
      console.log(`${ALERTS_API}&since=${this.state.lastAlertCheck}`, alertsResult);
      const alertsData = alertsResult.data;

      this.setState({
        alerts: alertsData,
        isLoading: false,
        lastAlertCheck: Date.now()
      });
    } catch (error) {
      this.setState({
        error,
        isLoading: false,
        lastAlertCheck: Date.now()
      });
    }
  }

  async getEnvVars() {
    this.setState({ isLoading: true });

    try {
      const envVarsResult = await axios.get(ENV_VARS_API);
      const envVarsData = envVarsResult.data;

      this.setState({
        env_vars: envVarsData,
        isLoading: false
      });
    } catch (error) {
      this.setState({
        error,
        isLoading: false
      });
    }
  }

  showAlert() {
    let alerts = this.state.alerts;
    if (alerts.length> 0) {
      const message = alerts.reverse().pop();
      this.setState({
        alertMessage: message.alert,
        alerts: alerts
      })
    } else if (this.state.alertMessage) {
      this.setState({
        alertMessage: null
      });
    }
  }

  async componentDidMount() {
    await this.getHealthData();
    await this.getAlerts();
    await this.getEnvVars();

    this.fetchInterval = setInterval(async () => {
      await this.getHealthData();
      await this.getAlerts();
    }, 30000);

    this.alertInterval = setInterval(() => {
      this.showAlert();
    }, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
    clearInterval(this.alertInterval);
  }

  render() {
    return (
      <div>
        <header>
          {this.state.alertMessage &&
            <Alert className="sticky" theme="danger">
              {this.state.alertMessage}
            </Alert>}
          <TopNav />
        </header>
        <Container>
          <Row>
            <Col>
            <h1 className="title">{this.state.device} ({this.state.model})</h1>
            </Col>
          </Row>
          <Row>
            <Col>
            <Badge>{new Date(this.state.lastReading*1000).toLocaleString()}</Badge>
            </Col>
          </Row>
          <Row>
            <Col>
              <HeartRateInfo bpm={this.state.currentHeartRate} />
            </Col>
            <Col>
              <TempInfo temp={this.state.currentTemp} />
            </Col>
            <Col>
              <BatteryInfo battery={this.state.currentBattery} />
            </Col>
            <Col>
              <SoundInfo sound={this.state.currentSoundLevel} />
            </Col>
          </Row>
          <LineChart readings={this.state.readings} />
        </Container>
      </div>
    );
  }

}

export default App;
