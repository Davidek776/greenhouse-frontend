import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { AiOutlineDown } from "react-icons/ai";

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

interface DropdownProps {
  title: string;
  options: string[];
  onSelect: (option: string) => void;
}

export default function Dropdown({ title, options, onSelect }: DropdownProps) {
  const select = (value: string) => {
    onSelect(value);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5  px-3 py-2 text-sm rounded-md text-gray-900 hover:bg-white hover:bg-opacity-30">
          {title}
          <AiOutlineDown
            className="-mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-20 mt-2 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option}>
                {({ active }) => (
                  <div
                    onClick={() => {
                      select(option);
                    }}
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block cursor-pointer px-4 py-2 text-sm"
                    )}
                  >
                    {option}
                  </div>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
