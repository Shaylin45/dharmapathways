import RawHtml from '@/components/RawHtml';
import { fit_checkHtml } from '@/components/pageHtml';

export default function Page() {
  return <RawHtml html={fit_checkHtml} />;
}
