'use client';

import * as React from 'react';
import { PreviewCard as PreviewCardPrimitives } from '@base-ui-components/react/preview-card';
import { AnimatePresence, motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { cn } from '@/lib/utils';

type PreviewCardContextType = {
  isOpen: boolean;
};

const PreviewCardContext = React.createContext<PreviewCardContextType | undefined>(undefined);

const usePreviewCard = (): PreviewCardContextType => {
  const context = React.useContext(PreviewCardContext);
  if (!context) {
    throw new Error('usePreviewCard must be used within a PreviewCard');
  }
  return context;
};

type Side = React.ComponentPropsWithoutRef<typeof PreviewCardPrimitives.Positioner>['side'];

type Align = React.ComponentPropsWithoutRef<typeof PreviewCardPrimitives.Positioner>['align'];

const getInitialPosition = (side: Side) => {
  switch (side) {
    case 'top':
      return { y: 15 };
    case 'bottom':
      return { y: -15 };
    case 'left':
    case 'inline-start':
      return { x: 15 };
    case 'right':
    case 'inline-end':
      return { x: -15 };
  }
};

type PreviewCardProps = React.ComponentProps<typeof PreviewCardPrimitives.Root>;

function PreviewCard(props: PreviewCardProps) {
  const [isOpen, setIsOpen] = React.useState(props?.open ?? props?.defaultOpen ?? false);

  React.useEffect(() => {
    if (props?.open !== undefined) setIsOpen(props.open);
  }, [props?.open]);

  const handleOpenChange = React.useCallback(
    (
      open: boolean,
      event: Event | undefined,
      reason: Parameters<NonNullable<PreviewCardProps['onOpenChange']>>[2],
    ) => {
      setIsOpen(open);
      props.onOpenChange?.(open, event, reason);
    },
    [props],
  );

  return (
    <PreviewCardContext.Provider value={{ isOpen }}>
      <PreviewCardPrimitives.Root
        data-slot="preview-card"
        {...props}
        onOpenChange={handleOpenChange}
      />
    </PreviewCardContext.Provider>
  );
}

type PreviewCardTriggerProps = React.ComponentProps<typeof PreviewCardPrimitives.Trigger>;

function PreviewCardTrigger(props: PreviewCardTriggerProps) {
  return <PreviewCardPrimitives.Trigger data-slot="preview-card-trigger" {...props} />;
}

type PreviewCardContentProps = React.ComponentProps<typeof PreviewCardPrimitives.Positioner> & {
  transition?: Transition;
  popupProps?: typeof PreviewCardPrimitives.Popup;
  motionProps?: HTMLMotionProps<'div'>;
  positionerClassName?: string;
};

function PreviewCardContent({
  className,
  popupProps,
  motionProps,
  positionerClassName,
  side = 'bottom',
  sideOffset = 10,
  transition = { type: 'spring', stiffness: 300, damping: 25 },
  children,
  ...props
}: PreviewCardContentProps) {
  const { isOpen } = usePreviewCard();
  const initialPosition = getInitialPosition(side);

  return (
    <AnimatePresence>
      {isOpen && (
        <PreviewCardPrimitives.Portal keepMounted data-slot="preview-card-portal">
          <PreviewCardPrimitives.Positioner
            data-slot="preview-card-positioner"
            side={side}
            sideOffset={sideOffset}
            className={cn('z-50', positionerClassName)}
            {...props}
          >
            <PreviewCardPrimitives.Popup
              data-slot="preview-card-popup"
              {...popupProps}
              className={cn(
                'bg-popover text-popover-foreground w-64 rounded-lg border p-4 shadow-md outline-none',
                className,
              )}
              render={
                <motion.div
                  key="preview-card-content"
                  initial={{ opacity: 0, scale: 0.5, ...initialPosition }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, ...initialPosition }}
                  transition={transition}
                  {...motionProps}
                />
              }
            >
              {children}
            </PreviewCardPrimitives.Popup>
          </PreviewCardPrimitives.Positioner>
        </PreviewCardPrimitives.Portal>
      )}
    </AnimatePresence>
  );
}

export {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardContent,
  usePreviewCard,
  type PreviewCardProps,
  type PreviewCardTriggerProps,
  type PreviewCardContentProps,
  type Side,
  type Align,
};
