import { LiveChat } from "../LiveChat/LiveChat";
import { FeaturePage } from "./FeaturePage";
import { PriorityPage } from "./PriorityPage";
import { UtilitiesPage } from "./UtilitiesPage";

export const LandingPage = () => {
  return (
    <div>
      <FeaturePage />
      <PriorityPage />
      <UtilitiesPage />
      <LiveChat />
    </div>
  );
};
