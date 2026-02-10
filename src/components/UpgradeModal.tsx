import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Check, Zap } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignIn: () => Promise<void>;
  generationsUsed: number;
}

const UpgradeModal = ({
  open,
  onOpenChange,
  onSignIn,
  generationsUsed,
}: UpgradeModalProps) => {
  const handleSignIn = async () => {
    await onSignIn();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">You've Used Your Free Credits!</DialogTitle>
          <DialogDescription className="text-base pt-2">
            You've generated {generationsUsed} posts. Sign in with Google for unlimited access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Unlock with Google Sign-In
            </h4>
            <ul className="space-y-2">
              {[
                "Unlimited post generations",
                "Save posts to your history",
                "Access from any device",
                "Priority support",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4">
            <GoogleSignInButton
              onSignIn={handleSignIn}
              size="lg"
              className="w-full"
            />
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
