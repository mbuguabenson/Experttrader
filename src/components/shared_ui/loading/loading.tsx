import React from 'react';
import classNames from 'classnames';
import Text from '../text/text';

export type TLoadingProps = React.HTMLProps<HTMLDivElement> & {
    is_fullscreen: boolean;
    is_slow_loading: boolean;
    status: string[];
    theme: string;
};

const Loading = ({ className, id, is_fullscreen = true, is_slow_loading, status, theme }: Partial<TLoadingProps>) => {
    const theme_class = theme ? `barspinner-${theme}` : 'barspinner-light';
    return (
        <div
            data-testid='dt_initial_loader'
            className={classNames(
                'initial-loader',
                {
                    'initial-loader--fullscreen': is_fullscreen,
                },
                className
            )}
        >
            <div className='initial-loader__container'>
                <div className='initial-loader__glowing-ring' />
                <div className='initial-loader__icon'>
                    <svg
                        width='64'
                        height='64'
                        viewBox='0 0 28 28'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <rect x='0' y='0' width='28' height='28' rx='6' fill='#00848c' />
                        <polyline
                            points='5,20 10,14 15,17 23,7'
                            stroke='#ffffff'
                            strokeWidth='2.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            fill='none'
                        />
                        <polyline
                            points='19,7 23,7 23,11'
                            stroke='#fec20f'
                            strokeWidth='2.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            fill='none'
                        />
                    </svg>
                </div>
            </div>
            {is_slow_loading &&
                status?.map((text, inx) => (
                    <Text as='h3' color='prominent' size='xs' align='center' key={inx}>
                        {text}
                    </Text>
                ))}
        </div>
    );
};

export default Loading;
