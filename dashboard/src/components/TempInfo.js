import React from "react";
import {
  Card,
  CardTitle,
  CardBody,
} from "shards-react";
import { ThermometerHigh, ThermometerHalf, ThermometerLow } from 'react-bootstrap-icons';

function ThermometerImage(props) {
  const temp = props.temp;
  if (temp > 80) {
    return <ThermometerHigh size={40} />;
  } else if (temp > 50) {
    return <ThermometerHalf size={40} />;
  } else {
    return <ThermometerLow size={40} />;
  }
}

export default function TempInfo(props) {
  return (
    <Card className="dashboard-card" style={{ maxWidth: "300px", maxHeight: "150px" }}>
      <CardBody>
        <CardTitle>Current Temp</CardTitle>
        <h3>{props.temp}&deg; F <ThermometerImage temp={props.temp} />
        </h3>
      </CardBody>
    </Card>
  );
}
