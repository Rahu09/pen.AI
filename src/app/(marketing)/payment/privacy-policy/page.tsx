import { PolicyPage } from "@/components/marketing/PolicyPage";
import { ContactLine } from "@/components/marketing/ContactLine";
import { SITE_NAME } from "@/config/site";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: `Privacy policy | ${SITE_NAME}`,
  description: `What ${SITE_NAME} stores about you, who processes it, and how to delete it.`,
});

// Keep this page in step with the code: every service named here is one the
// app actually sends data to (see docs/PROJECT.md, "External services").
export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy policy"
      intro="What we store about you, which services handle it, and how to remove it."
      current="/payment/privacy-policy"
    >
      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Your account:</strong> your email address and an account id
          from our login provider.
        </li>
        <li>
          <strong>Your documents:</strong> the PDFs you upload, the text we
          read from them, and a numeric representation of that text (an
          &quot;embedding&quot;) used to find the passages that match a
          question.
        </li>
        <li>
          <strong>Your chats:</strong> the questions you ask and the answers.
        </li>
        <li>
          <strong>Your subscription:</strong> if you subscribe, your Stripe
          customer and subscription ids, your plan and when it renews. We
          never see or store your card details.
        </li>
      </ul>

      <h2>Who handles it</h2>
      <p>
        {SITE_NAME} is built on these services, and each one processes the
        data it needs:
      </p>
      <ul>
        <li>
          <strong>Kinde</strong> runs sign-in and holds your login details.
        </li>
        <li>
          <strong>UploadThing</strong> stores the PDF files you upload.
        </li>
        <li>
          <strong>Neon</strong> hosts our database: your account, document
          text, embeddings and chats.
        </li>
        <li>
          <strong>Google (Gemini API)</strong> receives your document text to
          create embeddings, and your question with the matching passages to
          write each answer. We use Google&apos;s free tier, under which
          Google may use the content it receives to improve its products. Do
          not upload documents that must not be shared with Google.
        </li>
        <li>
          <strong>Stripe</strong> handles payments for Pro.
        </li>
        <li>
          <strong>Vercel</strong> hosts the website and runs its server code.
        </li>
      </ul>
      <p>
        We do not sell your data, show ads or use analytics or tracking
        cookies. The cookies we set are the ones sign-in needs, plus your
        theme choice saved in your browser.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Documents and chats stay until you delete them. Deleting a document
        removes the file, its text, its embeddings and its chat. Your account
        and subscription records stay until you ask us to delete the account.
      </p>

      <h2>Your choices</h2>
      <p>
        You can delete any document yourself from your files. To get a copy
        of your data, or to delete your account and everything in it,{" "}
        <ContactLine />. Please do not put personal or payment details in a
        public GitHub issue; say what you need and we will reply privately.
      </p>
    </PolicyPage>
  );
}
