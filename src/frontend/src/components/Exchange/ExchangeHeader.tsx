import { useEffect, useState } from "react";
import { showModal } from "../../redux/reducers/modals";

import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import "./exchange.header.scss";
import { retrieveTopPools, selectInfo } from "../../redux/reducers/info";
import { useTonClient } from "../../hook/useTonClient";

export default function ExchangeHeader() {
  const [isShow, setIsShow] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const info = useAppSelector(selectInfo);
  const client = useTonClient();

  const showTokenPair = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setIsShow(!isShow);
  };

  const handleSettingModal = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    dispatch(showModal("exchange-setting"));
  };

  useEffect(() => {
    if (client) {
      dispatch(retrieveTopPools(client));
    }
  }, [client]);

  return (
    <div className="grid grid-flow-col items-center justify-between w-full header-border">
      <div className="grid grid-flow-col items-center">
        <div className="grid grid-flow-col items-center gap-2.5 bg-[#2b2e4a] h-14">
          <div className="relative px-5">
            <div className="grid grid-flow-col items-center gap-2">
              <img
                className=" block h-6 w-6"
                src="https://zigzag-exchange.netlify.app/static/media/ETH.d429b636.svg"
                alt="ETH"
              ></img>
              <button className="tokenpair-button" onClick={showTokenPair}>
                <div className="tokenpair-div">TON / USDT</div>
                {!isShow ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
            {isShow ? (
              <div>
                <div className="token-pair-dropdown">
                  <div className="token-pair-dropdown-search-panel">
                    <div className="token-search-panel-container">
                      <div className="token-search-panel-main-container">
                        <div className="token-search-icon-div">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Search for a token pair"
                          className="token-search-input-form"
                        ></input>
                      </div>
                    </div>
                  </div>
                  <div className="token-pair-divider"></div>
                  <div className="token-pair-main-content">
                    <div className="token-pair-content-tab-menu">
                      <div className="token-pair-tab-item">
                        <div className="token-pair-tab-item-content-selected token-pair-tab-item-content-common">
                          All
                        </div>
                      </div>
                    </div>
                    <div>
                      {info.topPools &&
                        info.topPools.map((pool, index) => {
                          return (
                            <div key={index}>
                              {pool.token1?.symbol} / {pool.token2?.symbol}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
        <div className="exchange-header-navbar items-center justify-center text-center hidden lg:grid">
          <div className=" cursor-pointer relative">
            <div className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </div>
          </div>
          <div className="exchange-header-navbar-item">
            <div className="navbar-item-green-top">1.005</div>
            <div className="navbar-item-white-bottom">$ 0.9988</div>
          </div>
          <div className="header-divider" />
          <div className="exchange-header-navbar-item">
            <div className="navbar-item-gray-top">24h Change</div>
            <div className="navbar-item-red-bottom">-0.9988 | -1.25%</div>
          </div>
          <div className="header-divider" />
          <div className="exchange-header-navbar-item">
            <div className="navbar-item-gray-top">24h High</div>
            <div className="navbar-item-red-bottom text-white">2084.08</div>
          </div>
          <div className="header-divider" />
          <div className="exchange-header-navbar-item">
            <div className="navbar-item-gray-top">24h Low</div>
            <div className="navbar-item-red-bottom text-white">1203.08</div>
          </div>
          <div className="header-divider" />
          <div className="exchange-header-navbar-item">
            <div className="navbar-item-gray-top">24h Volume(ETH)</div>
            <div className="navbar-item-red-bottom text-white">1121.08</div>
          </div>
          <div className="header-divider" />
          <div className="exchange-header-navbar-item">
            <div className="navbar-item-gray-top">24h Volume(USDC)</div>
            <div className="navbar-item-red-bottom text-white">1121.08</div>
          </div>
        </div>
      </div>
      <button
        className="exchange-header-setting-btn md:visible"
        onClick={handleSettingModal}
      >
        Settings
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="ml-2 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  );
}
