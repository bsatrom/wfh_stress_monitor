import React, { Component } from "react";
import {
  Button,
  Form,
  FormGroup,
  FormInput,
  Modal,
  ModalBody,
  ModalHeader
} from "shards-react";
import axios from 'axios';

const ENV_VARS_API = process.env.REACT_APP_SET_ENV_VARS_URL;

class EnvVars extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      notify_hr: this.props.notify_hr,
      sound_max: this.props.sound_max,
      notify_batt: this.props.notify_batt
    };

    this.toggle = this.toggle.bind(this);
    this.saveEnvVars = this.saveEnvVars.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (state.open) return null;

    if ((props.notify_hr !== state.notify_hr) ||
        (props.sound_max !== state.sound_max) ||
        (props.notify_batt !== state.notify_batt)) {
      return {
        notify_hr: props.notify_hr,
        sound_max: props.sound_max,
        notify_batt: props.notify_batt
      };
    }

    // Return null to indicate no change to state.
    return null;
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  async saveEnvVars() {
    const { notify_batt, notify_hr, sound_max } = this.state;
    const body = {
      "environment_variables": {
        "notify_batt": notify_batt,
        "notify_hr": notify_hr,
        "sound_max": sound_max
      }
    };

    await axios.put(
      `${ENV_VARS_API}`,
      body
    );
  }

  render() {
    const open = this.state.open;
    const { notify_batt, notify_hr, sound_max } = this.state;

    return (
      <div>
        <Button onClick={this.toggle}>Notification Settings</Button>
        <Modal className="envVarsModal" open={open} toggle={this.toggle}>
          <ModalHeader>Notification Thresholds</ModalHeader>
          <ModalBody>
          <Form>
            <FormGroup>
              <label htmlFor="notifyHr">High Heart Rate</label>
              <FormInput
                name="notify_hr"
                id="notifyHr"
                value={notify_hr}
                onChange={this.handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <label htmlFor="notifySound">High Sound Level</label>
              <FormInput
                name="sound_max"
                id="notifySound"
                value={sound_max}
                onChange={this.handleInputChange}
            />
            </FormGroup>
            <FormGroup>
              <label htmlFor="notifyBatt">Low Battery</label>
              <FormInput
                name="notify_batt"
                id="notifyBatt"
                value={notify_batt}
                onChange={this.handleInputChange}
              />
            </FormGroup>
            <Button onClick={this.saveEnvVars}>Save</Button>&nbsp;
            <Button theme="secondary" onClick={this.toggle}>Cancel</Button>
          </Form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default EnvVars;