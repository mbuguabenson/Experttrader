import { Suspense } from 'react';
import { observer } from 'mobx-react-lite';
import { useDevice } from '@deriv-com/ui';
import Loading from '@/components/shared_ui/loading/loading';
import ChartModalDesktop from './chart-modal-desktop';

export const ChartModal = observer(() => {
    const { isDesktop } = useDevice();
    return <Suspense fallback={<Loading is_fullscreen={false} />}>{isDesktop && <ChartModalDesktop />}</Suspense>;
});

export default ChartModal;
