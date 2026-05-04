import RawHtml from './RawHtml';
import { navHtml } from './siteHtml';

export default function Navigation() {
  return <RawHtml html={navHtml} />;
}
