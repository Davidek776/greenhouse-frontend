import Chart from "react-apexcharts";
import ChartIcon from "src/components/UI/RectIcon";
import Dropdown from "src/components/UI/Dropdown";
import capitalize from "src/utils/capitalize";
import Measurement from "src/domain/Measurement";
import { DateTime, Duration } from "luxon";
import { useState } from "react";
import TimeScope from "src/domain/TimeScope";

interface LineChartProps {
  measurements: Measurement[] | null;
  type: string;
  bgColor: string;
  accentColor: string;
  icon: JSX.Element;
}

export default function LineChart({
  measurements,
  type,
  bgColor,
  accentColor,
  icon,
}: LineChartProps) {
  const timeScopes = [
    new TimeScope("last hour", Duration.fromObject({ hours: 1 })),
    new TimeScope("6 hours", Duration.fromObject({ hours: 6 })),
    new TimeScope("12 hours", Duration.fromObject({ hours: 12 })),
    new TimeScope(
      "day",
      Duration.fromObject({ days: 1 }),
      Duration.fromObject({ hours: 1 })
    ),
    new TimeScope(
      "week",
      Duration.fromObject({ weeks: 1 }),
      Duration.fromObject({ hours: 6 })
    ),
    new TimeScope(
      "month",
      Duration.fromObject({ months: 1 }),
      Duration.fromObject({ days: 1 })
    ),
  ];

  const [timeScope, setTimeScope] = useState(timeScopes[0]);

  const cutOffTimestamp = DateTime.now().minus(timeScope.scope).toMillis();

  const averageMeasurements = (
    measurements: Measurement[],
    durationInMilliseconds: number
  ): Measurement[] => {
    const averagedData = [];
    let sum: number = 0;
    let count: number = 0;
    let startTime: number = measurements[0].timestamp;

    for (let i = 0; i < measurements.length; i++) {
      const currentData = measurements[i];
      sum += parseFloat(currentData.value as unknown as string);
      count++;

      const elapsedTime = currentData.timestamp - startTime;
      if (elapsedTime >= durationInMilliseconds) {
        const averageValue = sum / count;
        const averagedMeasurement = new Measurement(
          Math.round(averageValue * 100) / 100,
          startTime
        );
        averagedData.push(averagedMeasurement);

        // Reset variables for the next group
        sum = 0;
        count = 0;
        startTime = currentData.timestamp;
      }
    }

    return averagedData;
  };

  if (measurements == null) {
    measurements = [];
  }

  measurements = measurements.filter(
    ({ timestamp }) => timestamp >= cutOffTimestamp
  );

  if (timeScope.averageTo !== undefined) {
    measurements = averageMeasurements(
      measurements,
      timeScope.averageTo.toMillis()
    );
  }

  const series = [
    {
      name: capitalize(type),
      data: measurements.map(({ value }) => value),
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      fontFamily: "Sora",
      type: "line",
      zoom: {
        enabled: false,
      },
    },

    theme: {
      mode: "light",
      palette: "palette9",
      monochrome: {
        enabled: false,
        color: "#255aee",
        shadeTo: "light",
        shadeIntensity: 0.65,
      },
    },

    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      colors: ["#555555"],
      width: 3,
    },
    labels: measurements.map(({ timestamp }) =>
      new Date(timestamp).toLocaleString()
    ),
    xaxis: {
      type: "datetime",
      labels: {
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
          hour: "HH:mm",
        },
      },
    },
    yaxis: {},
  };
  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="bg-[#ffefde] p-2 font-sora shadow-sm max-sm:w-auto rounded-xl"
    >
      <div className="flex items-center">
        <div>
          <ChartIcon bgColor={accentColor} icon={icon} />
        </div>
        <div className="flex-grow font-sora ml-2 text-xl font-semibold">
          {capitalize(type)}
        </div>
        <div>
          <Dropdown
            title={"Interval"}
            onSelect={(option) =>
              setTimeScope(
                timeScopes.find(({ name }) => name === option) ?? timeScopes[0]
              )
            }
            options={timeScopes.map(({ name }) => name)}
          />
        </div>
      </div>
      <div className="xs:h-40 md:h-80">
        <Chart options={options} series={series} height={"100%"} />
      </div>
    </div>
  );
}
