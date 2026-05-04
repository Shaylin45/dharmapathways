import RawHtml from './RawHtml';
import { footerHtml } from './siteHtml';

export default function Footer() {
  return <RawHtml html={footerHtml} />;
}
