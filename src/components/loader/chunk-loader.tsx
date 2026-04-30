import React from 'react';
import Loading from '../shared_ui/loading/loading';

export default function ChunkLoader({ message }: { message: string }) {
    return <Loading is_fullscreen status={[message]} is_slow_loading={!!message} />;
}
