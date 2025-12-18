import { ArrowRightIcon, Square3Stack3DIcon, ShareIcon, ArrowTrendingDownIcon, ShieldCheckIcon, RocketLaunchIcon } from "@heroicons/react/20/solid"


export const UtilitiesPage  = () => {
    return(
        <div className=" bg-littledark pl-10 pt-16 pb-20">
            <div className="container w-4/5 mx-auto flex flex-col gap-10 justify-center">
                <div className="py-0 text-left">
                    <span className="mt-3 font-serif font-black sm:text-3xl lg:text-5xl text-[#ffffff]">Utilities</span>
                </div>
                <div className=" p-2 flex flex-row justify-between gap-6">
                    <div className=" w-1/2 flex flex-col gap-4 justify-between">
                        <div className="flex flex-col gap-3">
                            <span className="flex flex-row gap-2 font-semibold text-[#ffffff]"><Square3Stack3DIcon className="w-6 h-6 text-btn_color"></Square3Stack3DIcon>Layer-1 Blockchain</span>
                            <span>Ultra-scalable, designed by Telegram to onboard billions of users</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="flex flex-row gap-2 font-semibold text-[#ffffff]"><ShareIcon className="w-6 h-6 text-btn_color"></ShareIcon>Decentralized</span>
                            <span>TON is a Proof-of-Stake network maintained by independent validators</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="flex flex-row gap-2 font-semibold text-[#ffffff]"><ArrowTrendingDownIcon className="w-6 h-6 text-btn_color"></ArrowTrendingDownIcon>Tiny fees</span>
                            <span className=" text-[#B7B6CE]">The average transaction cost is just a few cents</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="flex flex-row gap-2 font-semibold text-[#ffffff]"><ShieldCheckIcon className="w-6 h-6 text-btn_color"></ShieldCheckIcon>Secure</span>
                            <span className=" text-[#B7B6CE]">TON is audited by global security firms including Certik, Chainsulting and SlowMist.</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="flex flex-row gap-2 font-semibold text-[#ffffff]"><RocketLaunchIcon className="w-6 h-6 text-btn_color"></RocketLaunchIcon>World-Class Speed</span>
                            <span className=" text-[#B7B6CE]">Transactions are confirmed in a matter of seconds</span>
                        </div>
                    </div>    
                    <img src = "assets/img/the_glass_cube.png" className="hidden w-1/2 scale-x-150 scale-y-125 lg:block"></img>
                </div>
            </div>
        </div>
    )
}