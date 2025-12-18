import { Tab, initTE } from "tw-elements";
import "./limit_order.scss";
import LimitForm from "./LimitForm";
import { Link } from "react-router-dom";

export const LimitOrderTab = () => {
  initTE({ Tab });
  return (
    <div>
      {/* <ul
        className="flex list-none flex-row flex-wrap border-b pl-0 border-gray-500"
        role="tablist"
        data-te-nav-ref
      >
        <li role="presentation">
          <a
            href="#tabs-limit"
            className=" w-16 text-center focus:border-sky-500 my-2 block border-x-0 border-b-2 border-t-0 border-transparent pb-3.5 pt-4 text-xs font-medium leading-tight text-neutral-500 hover:isolate hover:text-sky-500 focus:isolate data-[te-nav-active]:border-primary data-[te-nav-active]:text-primary dark:text-neutral-400 dark:hover:bg-transparent dark:data-[te-nav-active]:border-primary-400 dark:data-[te-nav-active]:text-primary-400 focus:text-sky-500"
            data-te-toggle="pill"
            data-te-target="#tabs-limit"
            data-te-nav-active
            role="tab"
            aria-controls="tabs-limit"
            aria-selected="true"
          >
            Limit
          </a>
        </li>
        <li role="presentation">
          <a
            href="#tabs-market"
            className="w-16 focus:border-sky-500 text-center my-2 block border-x-0 border-b-2 border-t-0 border-transparent pb-3.5 pt-4 text-xs font-medium leading-tight text-neutral-500 hover:isolate hover:text-sky-500 focus:isolate data-[te-nav-active]:border-primary data-[te-nav-active]:text-primary dark:text-neutral-400 dark:hover:bg-transparent dark:data-[te-nav-active]:border-primary-400 dark:data-[te-nav-active]:text-primary-400 focus:text-sky-500"
            data-te-toggle="pill"
            data-te-target="#tabs-market"
            role="tab"
            aria-controls="tabs-market"
            aria-selected="false"
          >
            Market
          </a>
        </li>
      </ul> */}
      <div className="pt-3">
        <div
          className="hidden opacity-100 transition-opacity duration-150 ease-linear data-[te-tab-active]:block"
          id="tabs-limit"
          role="tabpanel"
          aria-labelledby="tabs-limit-tab"
          data-te-tab-active
        >
          <LimitForm />
        </div>
        <div
          className="hidden text-center opacity-0 transition-opacity duration-150 ease-linear data-[te-tab-active]:block"
          id="tabs-market"
          role="tabpanel"
          aria-labelledby="tabs-market-tab"
        >
          <Link
            to="/swap"
            type="button"
            className="border rounded-md p-3 text-gray-400 hover:text-white/75 bg-transparent"
          >
            Go to Swap
          </Link>
        </div>
      </div>
    </div>
  );
};
