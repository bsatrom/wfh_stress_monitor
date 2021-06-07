import React from "react";
import {
  Card,
  CardTitle,
  CardBody,
} from "shards-react";
import { VolumeUpFill } from 'react-bootstrap-icons';

export default function SoundInfo(props) {
  return (
    <Card className="dashboard-card" style={{ maxWidth: "300px", maxHeight: "150px" }}>
      <CardBody>
        <CardTitle>Sound Level</CardTitle>
        <h3>
          {props.sound} dB <VolumeUpFill />
        </h3>
      </CardBody>
    </Card>
  );
}
