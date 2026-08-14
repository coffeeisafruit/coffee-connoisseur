import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: August 14, 2026</p>

          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using {APP_TITLE}, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our service.
          </p>

          <h2>Description of Service</h2>
          <p>
            {APP_TITLE} is a platform for coffee enthusiasts to discover specialty coffee roasters,
            track their brewing experiments, share reviews, and connect with the coffee community.
            We provide tools for:
          </p>
          <ul>
            <li>Building and tracking your coffee taste profile</li>
            <li>Maintaining a brew journal with detailed notes and photos</li>
            <li>Discovering and reviewing specialty coffee roasters</li>
            <li>Getting AI-powered coffee recommendations</li>
            <li>Connecting with other coffee enthusiasts</li>
          </ul>

          <h2>Account Registration</h2>
          <p>
            To use certain features of our service, you must create an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Be responsible for all activity under your account</li>
            <li>Be at least 13 years of age</li>
          </ul>

          <h2>User Content</h2>
          <h3>Your Content</h3>
          <p>
            You retain ownership of content you submit to {APP_TITLE}, including reviews, photos,
            brew journal entries, and profile information. By posting content, you grant us a
            worldwide, non-exclusive, royalty-free license to use, reproduce, and display your
            content in connection with operating and improving the service.
          </p>

          <h3>Content Standards</h3>
          <p>
            You agree not to post content that:
          </p>
          <ul>
            <li>Is illegal, harmful, threatening, abusive, or defamatory</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains false or misleading information</li>
            <li>Includes spam or unauthorized advertising</li>
            <li>Violates the privacy of others</li>
            <li>Contains malicious code or viruses</li>
          </ul>

          <h3>Reviews and Ratings</h3>
          <p>
            When posting reviews and ratings, you agree to:
          </p>
          <ul>
            <li>Base reviews on your genuine experience</li>
            <li>Not post fake, fraudulent, or malicious reviews</li>
            <li>Not manipulate ratings or reviews for commercial gain</li>
            <li>Respect roasters and other community members</li>
          </ul>

          <h2>Prohibited Activities</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Impersonate others or misrepresent your affiliation</li>
            <li>Interfere with or disrupt the service</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use automated tools to access or scrape the service</li>
            <li>Circumvent security or authentication measures</li>
            <li>Engage in commercial activity without authorization</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            The service and its original content (excluding user-generated content), features,
            and functionality are owned by {APP_TITLE} and protected by international copyright,
            trademark, and other intellectual property laws.
          </p>

          <h2>AI Features</h2>
          <p>
            Our service includes AI-powered features such as coffee recommendations and chat assistance.
            These features are provided for informational and entertainment purposes. We do not guarantee
            the accuracy, completeness, or suitability of AI-generated content.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            Our service may integrate with or link to third-party services and websites.
            We are not responsible for the content, privacy practices, or availability of
            third-party services.
          </p>

          <h2>Service Modifications and Availability</h2>
          <p>
            We reserve the right to:
          </p>
          <ul>
            <li>Modify, suspend, or discontinue any part of the service</li>
            <li>Change these terms at any time</li>
            <li>Refuse service to anyone for any reason</li>
          </ul>
          <p>
            We do not guarantee uninterrupted or error-free service availability.
          </p>

          <h2>Account Termination</h2>
          <p>
            We may suspend or terminate your account if you violate these terms or for any other
            reason at our discretion. You may delete your account at any time through your profile settings.
            Upon termination, your right to use the service immediately ceases.
          </p>

          <h2>Disclaimer of Warranties</h2>
          <p>
            The service is provided "as is" and "as available" without warranties of any kind,
            either express or implied, including but not limited to warranties of merchantability,
            fitness for a particular purpose, and non-infringement.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, {APP_TITLE} shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or any loss of
            profits or revenues, whether incurred directly or indirectly, or any loss of data,
            use, goodwill, or other intangible losses.
          </p>

          <h2>Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless {APP_TITLE} from any claims, damages, losses,
            liabilities, and expenses (including legal fees) arising from your use of the service,
            your violation of these terms, or your violation of any rights of another.
          </p>

          <h2>Governing Law and Disputes</h2>
          <p>
            These terms are governed by the laws of the United States. Any disputes shall be
            resolved through binding arbitration in accordance with the rules of the American
            Arbitration Association, except where prohibited by law.
          </p>

          <h2>Severability</h2>
          <p>
            If any provision of these terms is found to be unenforceable, the remaining provisions
            will continue in full force and effect.
          </p>

          <h2>Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at
            legal@coffeeconnoisseur.app
          </p>
        </div>
      </div>
    </div>
  );
}
