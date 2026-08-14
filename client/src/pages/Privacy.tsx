import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: August 14, 2026</p>

          <h2>Introduction</h2>
          <p>
            Welcome to {APP_TITLE}. We respect your privacy and are committed to protecting your personal data.
            This privacy policy explains how we collect, use, and safeguard your information when you use our service.
          </p>

          <h2>Information We Collect</h2>
          <h3>Account Information</h3>
          <p>
            When you create an account, we collect:
          </p>
          <ul>
            <li>Email address</li>
            <li>Display name</li>
            <li>Profile information you choose to provide</li>
          </ul>

          <h3>Usage Data</h3>
          <p>
            We collect information about how you interact with our service, including:
          </p>
          <ul>
            <li>Coffee reviews and ratings you submit</li>
            <li>Brew journal entries</li>
            <li>Coffee preferences and taste profile</li>
            <li>Roaster interactions and favorites</li>
          </ul>

          <h3>Technical Information</h3>
          <p>
            We automatically collect certain technical information when you use our service:
          </p>
          <ul>
            <li>Device and browser information</li>
            <li>IP address and general location data</li>
            <li>Usage analytics and performance metrics</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide and improve our service</li>
            <li>Personalize your coffee recommendations</li>
            <li>Enable community features like reviews and ratings</li>
            <li>Communicate with you about your account and service updates</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Data Sharing and Disclosure</h2>
          <p>
            We do not sell your personal data. We may share your information only in the following circumstances:
          </p>
          <ul>
            <li><strong>With your consent:</strong> When you explicitly choose to share information publicly (e.g., reviews, profile)</li>
            <li><strong>Service providers:</strong> With trusted third-party services that help us operate (e.g., hosting, analytics)</li>
            <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against
            unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is
            completely secure, and we cannot guarantee absolute security.
          </p>

          <h2>Your Rights</h2>
          <p>
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Data portability:</strong> Receive your data in a portable format</li>
            <li><strong>Objection:</strong> Object to certain processing of your data</li>
          </ul>

          <h2>Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to maintain your session, remember your preferences,
            and analyze service usage. You can control cookies through your browser settings, but some
            features may not function properly if you disable them.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Our service is not intended for users under 13 years of age. We do not knowingly collect
            personal information from children under 13.
          </p>

          <h2>International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own.
            We ensure appropriate safeguards are in place to protect your data during such transfers.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of significant
            changes by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions or concerns about this privacy policy or our data practices,
            please contact us at privacy@coffeeconnoisseur.app
          </p>
        </div>
      </div>
    </div>
  );
}
