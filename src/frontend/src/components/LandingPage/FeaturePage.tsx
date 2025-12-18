import { ArrowSmallRightIcon, CheckIcon } from "@heroicons/react/24/outline"

export const FeaturePage = () => {
    return (
        <div className=" bg-cover bg-center bg-[url('assets/img/landing_background.png')] h-full pt-24 pb-36">
            <div className=" container flex flex-col mx-auto align-middle h-full w-1/2">
                <div className="w-4/5 flex flex-col gap-7">
                    <h2 className=" font-bold">TON NETWORK</h2>
                    <span className=" font-black font-serif sm:text-lg lg:text-5xl">Revolutionizing the Future of Web3 and cryptocurrency through</span>
                    <div className="flex flex-col gap-2">
                        <span className="flex flex-row gap-2"><CheckIcon className="w-6 h-6 text-[#57F287]"/>Ultra-fast transactions</span>
                        <span className="flex flex-row gap-2"><CheckIcon className="w-6 h-6 text-[#57F287]"/>Vey Low Fees</span>
                        <span className="flex flex-row gap-2"><CheckIcon className="w-6 h-6 text-[#57F287]"/>Easy-to-use apps</span>
                        <span className="flex flex-row gap-2"><CheckIcon className="w-6 h-6 text-[#57F287]"/>Small carbon footprint</span>
                    </div>
                    <button className="w-fit bg-btn_color mt-5 flex flex-row gap-1">Read Whitepaper <ArrowSmallRightIcon className="w-6 h-6"/></button>
                </div>
            </div>
        </div>
    )
}