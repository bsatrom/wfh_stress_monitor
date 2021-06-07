import React from "react";
import {
  Card,
  CardTitle,
  CardBody
} from "shards-react";
import { HeartFill } from 'react-bootstrap-icons';

export default function HeartRateInfo(props) {
  return (
    <Card className="dashboard-card" style={{ maxWidth: "300px", maxHeight: "150px" }}>
      <CardBody>
        <CardTitle>Current Heart Rate</CardTitle>
        <h3>
          {props.bpm} bpm <HeartFill />
        </h3>
      </CardBody>
    </Card>
  );
}
