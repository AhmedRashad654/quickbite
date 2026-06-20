import { Separator } from "@/components/ui/separator";
import { ProfileInfo } from "../components/ProfileInfo";
import { AddressSection } from "../components/AddressSection";

const Profile = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and addresses
        </p>
      </div>

      <ProfileInfo />

      <Separator className="my-8" />

      <AddressSection />
    </div>
  );
};

export default Profile;
