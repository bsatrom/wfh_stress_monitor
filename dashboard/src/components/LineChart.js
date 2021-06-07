import { ResponsiveLine } from '@nivo/line';

import '../styles/LineChart.css'

const commonProperties = {
  width: 1000,
  height: 500,
  margin: { top: 40, right: 20, bottom: 60, left: 80 },
  animate: true,
  enableSlices: 'x',
};

const LineChart = (props) => {
  const readings = props.readings.sort((first, second) => first.created - second.created).slice(-30);

  const sortedTemps = readings.map(el => {
    return {
      "x": new Date(el.created*1000),
      "y": el.temp
    };
  });
  const sortedHRs = readings.map(el => {
    return {
      "x": new Date(el.created*1000),
      "y": el.bpm
    };
  });

  return (
    <div className="line-container">
      {readings && <ResponsiveLine
          {...commonProperties}
          data={[
            {
                "id": "Heart Rate",
                "color": "hsl(39, 70%, 50%)",
                "data": sortedHRs
            },
            {
                "id": "Temperature",
                "color": "hsl(199, 70%, 50%)",
                "data": sortedTemps
            },
        ]}
        xScale={{
            type: 'time',
            format: 'native',
            useUTC: false,
            precision: 'second',
        }}
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
        }}
        axisLeft={{
            legend: 'Reading',
            legendOffset: -40,
        }}
        axisBottom={{
            format: '%b %d %H:%M:%S',
            tickValues: 'every 10 minutes'
        }}
        pointSize={8}
        pointBorderWidth={1}
        pointBorderColor={{
            from: 'color',
            modifiers: [['darker', 0.3]],
        }}
        useMesh={true}
        enableSlices={false}
        legends={[
            {
                anchor: 'bottom-left',
                direction: 'column',
                justify: false,
                translateX: 0,
                translateY: 60,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 1,
                symbolSize: 14,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
      />}
    </div>
  );
};

export default LineChart;