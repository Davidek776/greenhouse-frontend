import IconButton from "src/components/UI/IconButton";
import { IoIosAdd } from "react-icons/io";
import WaterToggle from "./WaterToggle";
import WaterRuntime from "./WaterRuntime";
import { Duration } from "luxon";
import CreateIntervalModal from "./CreateIntervalModal";
import { Fragment, useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { WeekDays } from "src/domain/WeekDays";
import {
  groupIntervals,
  createIntervalPayload,
} from "src/utils/groupIntervals";
import { GroupedIntervals } from "src/domain/GroupedIntervals";
import ScheduleColumn from "./ScheduleColumn";
import * as waterSchedulingService from "src/services/WaterSchedulingService";
import Interval from "src/domain/Interval";
import { getToggle, postToggle } from "src/services/ToggleService";

export default function Watering() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const [open, setOpen] = useState(false);
  const [isWatering, setIsWatering] = useState(false);

  useEffect(() => {
    let mounted = true;
    getToggle().then((isOnline) => {
      if (mounted) {
        setIsWatering(isOnline);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleWaterService = async (isOn: boolean) => {
    const success = await postToggle(isOn, Duration.fromObject({ minutes: 5 }));
    if (success) {
      setIsWatering(isOn);
    } else {
      alert("Sorry, there was an error");
    }
  };

  const [intervals, setIntervals] = useState<GroupedIntervals>(
    groupIntervals([])
  );

  useEffect(() => {
    let mounted = true;
    waterSchedulingService.getSchedule().then((intervals) => {
      if (mounted) {
        setIntervals(groupIntervals(intervals));
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const addInverval = async (newIntervals: Interval[]) => {
    const payLoad = createIntervalPayload(intervals, newIntervals);

    const isSuccess = await waterSchedulingService.postSchedule(payLoad);

    if (isSuccess) {
      setIntervals(groupIntervals(payLoad));
    } else {
      alert("Interval update failed");
    }
  };
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 640);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="m-3">
        <div className="text-center text-xl my-7 items-center justify-center lg:mb-4 lg:justify-left sm:flex font-bold">
          Watering Schedule
          <div className="hidden ml-5 sm:block">
            <IconButton
              onClick={() => setOpen(true)}
              icon={<IoIosAdd className="text-white w-full h-full" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-6">
            <WaterToggle
              value={isWatering}
              updateValue={() => toggleWaterService(!isWatering)}
            />
          </div>
        </div>

        {isMobile ? (
          <Tab.Group>
            <div className="overflow-hidden h-20">
              <Tab.List className="flex min-w-full justify-between flex-shrink-0 gap-4 overflow-x-scroll overflow-y-hidden">
                {WeekDays.map((day) => (
                  <Tab key={day} as={Fragment}>
                    {({ selected }) => (
                      <div
                        className={[
                          "font-semibold flex-grow focus:outline-0 cursor-pointer text-center w-14 flex justify-center items-center h-16 my-4 py-4 px-2 flex-shrink-0 rounded-lg",
                          selected
                            ? "bg-[#202329] text-white"
                            : intervals[day].length > 0
                            ? "bg-[#E6F5FB]"
                            : "bg-[#F2F4F5]",
                        ].join(" ")}
                      >
                        {day.substring(0, 3)}
                      </div>
                    )}
                  </Tab>
                ))}
              </Tab.List>
            </div>
            <div className="font-semibold mt-10 mb-2">Timeline</div>
            <div className="mt-3">
              <IconButton
                onClick={() => setOpen(true)}
                icon={<IoIosAdd className="text-white w-full h-full" />}
              />
            </div>
            <Tab.Panels className="mt-4">
              {WeekDays.map((day) => (
                <Tab.Panel key={day}>
                  {intervals[day].map((interval, index) => (
                    <div key={index} className="mt-2">
                      <WaterRuntime
                        startTime={interval.startTime}
                        endTime={interval.endTime}
                      />
                    </div>
                  ))}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        ) : (
          <div className="grid gap-3 grid-cols-7">
            {WeekDays.map((day) => (
              <ScheduleColumn key={day} day={day} intervals={intervals[day]} />
            ))}
          </div>
        )}
      </div>
      <CreateIntervalModal
        onAdd={addInverval}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}