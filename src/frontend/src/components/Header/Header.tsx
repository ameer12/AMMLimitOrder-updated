import {
  TonConnectButton,
  TonConnectUI,
  TonConnectUIProvider,
  useTonConnectUI,
} from "@tonconnect/ui-react";
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

import { Link } from "react-router-dom";
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
} from "@heroicons/react/20/solid";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Disclosure, Popover, Transition } from "@headlessui/react";
import { useAppDispatch } from "../../redux/hooks";
import { useTonConnect } from "../../hook/useTonConnect";
import { retrieveTokens } from "../../redux/reducers/tokens";
import { connect } from "../../redux/reducers/account";

const products = [
  {
    name: "Analytics",
    description: "Get a better understanding of your traffic",
    href: "#",
    icon: ChartPieIcon,
  },
  {
    name: "Engagement",
    description: "Speak directly to your customers",
    href: "#",
    icon: CursorArrowRaysIcon,
  },
  {
    name: "Security",
    description: "Your customers’ data will be safe and secure",
    href: "#",
    icon: FingerPrintIcon,
  },
  {
    name: "Integrations",
    description: "Connect with third-party tools",
    href: "#",
    icon: SquaresPlusIcon,
  },
  {
    name: "Automations",
    description: "Build strategic funnels that will convert",
    href: "#",
    icon: ArrowPathIcon,
  },
];
const callsToAction = [
  { name: "Watch demo", href: "#", icon: PlayCircleIcon },
  { name: "Contact sales", href: "#", icon: PhoneIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tonConnectUi] = useTonConnectUI();

  const dispatch = useAppDispatch();

  const { address, connected } = useTonConnect();

  useEffect(() => {
    if (connected && address) {
      dispatch(connect(address));
      dispatch(retrieveTokens(address));
    }
  }, [address, connected]);

  return (
    <header className="bg-littledark fixed w-full border-b border-[#2B2649]">
      <nav
        className="mx-auto flex items-center justify-between p-6 lg:px-20"
        aria-label="Global"
      >
        <div className="flex lg:flex-1 items-center gap-2">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img
              className="h-8 w-auto rounded-lg"
              src="https://static.ston.fi/logo/ton_symbol.png"
              alt=""
            />
          </a>
          <p>TON DEX</p>
        </div>
        <div className="flex lg:hidden">
          {mobileMenuOpen == false ? (
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          ) : (
            <div></div>
          )}
        </div>
        <Popover.Group className="hidden lg:gap-x-12 lg:flex items-center">
          {/* <Popover className="relative">
            <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-white">
              Product
              <ChevronDownIcon
                className="h-5 w-5 flex-none text-gray-400"
                aria-hidden="true"
              />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
                <div className="p-4">
                  {products.map((item) => (
                    <div
                      key={item.name}
                      className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50"
                    >
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                        <item.icon
                          className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-auto">
                        <a
                          href={item.href}
                          className="block font-semibold text-gray-900"
                        >
                          {item.name}
                          <span className="absolute inset-0" />
                        </a>
                        <p className="mt-1 text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 divide-x divide-white/70 bg-gray-50">
                  {callsToAction.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100"
                    >
                      <item.icon
                        className="h-5 w-5 flex-none text-gray-400"
                        aria-hidden="true"
                      />
                      {item.name}
                    </a>
                  ))}
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>
          */}

          <Link
            to="/swap"
            className="text-sm font-semibold leading-6 text-white"
          >
            Swap
          </Link>
          <Link
            to="/liquidity"
            className="text-sm font-semibold leading-6 text-white"
          >
            Liquidity
          </Link>
          <Link
            to="/exchange"
            className="text-sm font-semibold leading-6 text-white"
          >
            Exchange
          </Link>
          {/*<Link
            to="/exchange"
            className="text-sm font-semibold leading-6 text-white"
          >
            Company
          </Link> */}
        </Popover.Group>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-12">
          {/* <button className="inline-flex gap-2 text-sm font-semibold leading-6 text-white bg-transparent"
          onClick={() => tonConnectUi.connectWallet()}>
          <p>Connect Wallet</p>
          <WalletIcon className="h-6 w-6" aria-hidden="true" />
        </button> */}
          {/* <Link
            to="/exchange"
            className="flex flex-row hover:text-btn_color hover:scale-110 hover:transition-all "
          >
            Go to App
            <PaperAirplaneIcon className="ml-2 w-6 h-6"></PaperAirplaneIcon>
          </Link> */}
          <TonConnectButton />
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-gray-700 px-6 py-6">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
              />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/75">
              <div className="space-y-2 py-6">
                <a
                  href="/swap"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white/70 hover:bg-white hover:text-black"
                >
                  Swap
                </a>
                <a
                  href="/liquidity"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white/70 hover:bg-white hover:text-black"
                >
                  Liquidity
                </a>
                <Link
                  to="/exchange"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white/70 hover:bg-white hover:text-black"
                >
                  Exchange
                </Link>
              </div>
              <div className="py-6 flex justify-center">
                {/* <Link to="/exchange" className="flex flex-row">
                  Go to App{" "}
                  <PaperAirplaneIcon className="ml-2 w-6 h-6"></PaperAirplaneIcon>
                </Link> */}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};
