'use client';

import * as React from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  type SpringOptions,
  type UseInViewOptions,
} from 'motion/react';

import { cn } from '@/lib/utils';
import { Star } from '@/components/animate-ui/icons/star';

const formatter = new Intl.NumberFormat('en-US');

function generateRange(max: number, step: number, sideItemsCount: number): number[] {
  const result: number[] = [];
  const end = max + sideItemsCount * step;
  for (let value = end; value >= 0; value -= step) {
    result.push(value);
  }
  return result;
}

type StarsScrollingWheelProps = {
  stars: number;
  step?: number;
  itemHeight?: number;
  sideItemsCount?: number;
  transition?: SpringOptions;
  inView?: boolean;
  inViewOnce?: boolean;
  inViewMargin?: UseInViewOptions['margin'];
  delay?: number;
} & React.ComponentProps<'div'>;

function StarsScrollingWheel({
  ref,
  stars,
  step = 100,
  itemHeight = 48,
  sideItemsCount = 2,
  transition = { stiffness: 90, damping: 30 },
  inView = false,
  inViewOnce = true,
  inViewMargin = '0px',
  delay = 0,
  className,
  style,
  ...props
}: StarsScrollingWheelProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const inViewResult = useInView(containerRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;

  const displayedItemsCount = 1 + sideItemsCount * 2;
  const range = React.useMemo(
    () => generateRange(stars, step, sideItemsCount),
    [stars, step, sideItemsCount],
  );

  const initialY = -(itemHeight * sideItemsCount);
  const finalY = itemHeight * (range.length - displayedItemsCount);

  const yMotion = useMotionValue(initialY);
  const ySpring = useSpring(yMotion, transition);

  React.useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      yMotion.set(finalY);
    }, delay);
    return () => clearTimeout(timer);
  }, [isInView, finalY, yMotion, delay]);

  const currentIndex = useTransform(ySpring, (y) => y / itemHeight + sideItemsCount);
  const currentValue = useTransform(currentIndex, (idx) => idx * step);
  const completedTransform = useTransform(currentValue, (val) => val >= stars * 0.99);

  const [isCompleted, setCompleted] = React.useState<boolean>(completedTransform.get());
  React.useEffect(() => {
    const unsubscribe = completedTransform.on('change', (latest) => {
      if (latest) setCompleted(true);
    });
    return unsubscribe;
  }, [completedTransform]);

  return (
    <div
      ref={containerRef}
      className={cn('bg-background relative w-[200px] overflow-hidden', className)}
      style={{ height: itemHeight * displayedItemsCount, ...style }}
      {...props}
    >
      <div
        className="to-background absolute inset-x-0 top-0 z-2 bg-gradient-to-t from-transparent"
        style={{ height: itemHeight }}
      />
      <div
        className="bg-background/60 absolute inset-x-0 top-0 z-1"
        style={{ height: itemHeight * sideItemsCount }}
      />

      <div
        className="to-background absolute inset-x-0 bottom-0 z-1 bg-gradient-to-b from-transparent"
        style={{ height: itemHeight }}
      />
      <div
        className="bg-background/60 absolute inset-x-0 bottom-0 z-1"
        style={{ height: itemHeight * sideItemsCount }}
      />

      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center">
        <div
          className="bg-muted flex w-full items-center justify-start rounded-xl px-6"
          style={{ height: itemHeight }}
        >
          <div className="relative inline-flex size-[28px] shrink-0">
            <Star animation="fill" animate={isCompleted} className="text-yellow-500" />
            <AnimatePresence>
              {isCompleted && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)',
                    }}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: [1.2, 1.8, 1.2], opacity: [0, 0.3, 0] }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: '0 0 10px 2px rgba(255,215,0,0.6)' }}
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-1 w-1 rounded-full bg-yellow-500"
                      initial={{ x: '50%', y: '50%', scale: 0, opacity: 0 }}
                      animate={{
                        x: `calc(50% + ${Math.cos((i * Math.PI) / 3) * 30}px)`,
                        y: `calc(50% + ${Math.sin((i * Math.PI) / 3) * 30}px)`,
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.05,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-17 flex flex-col items-center justify-center text-start"
        style={{ y: ySpring }}
      >
        {range.map((value) => (
          <div
            key={value}
            className="flex w-full items-center justify-start text-2xl font-bold"
            style={{ height: itemHeight }}
          >
            {formatter.format(value)}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export { StarsScrollingWheel, type StarsScrollingWheelProps };
