'use client'

import { motion } from 'framer-motion'
import {
  User,
  Briefcase,
  Home,
  Users,
  ClipboardList,
  FileText,
  CheckCircle,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WIZARD_STEPS, type WizardStep } from './types'

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  briefcase: Briefcase,
  home: Home,
  users: Users,
  'clipboard-list': ClipboardList,
  'file-text': FileText,
  'check-circle': CheckCircle,
  'credit-card': CreditCard,
}

interface WizardProgressProps {
  currentStep: number
  completedSteps: number[]
  onStepClick?: (step: number) => void
  steps?: WizardStep[]
}

export function WizardProgress({
  currentStep,
  completedSteps,
  onStepClick,
  steps = WIZARD_STEPS,
}: WizardProgressProps) {
  return (
    <div className="w-full">
      {/* Desktop Progress - Horizontal */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Background line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 border-border" />

          {/* Progress line */}
          <motion.div
            className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
            initial={{ width: 0 }}
            animate={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <StepIndicator
                key={step.id}
                step={step}
                index={index}
                currentStep={currentStep}
                isCompleted={completedSteps.includes(index)}
                onClick={() => onStepClick?.(index)}
                isClickable={
                  completedSteps.includes(index) || index <= currentStep
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Progress - Compact */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              key={currentStep}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                {(() => {
                  const Icon = STEP_ICONS[steps[currentStep]?.icon] || User
                  return <Icon className="w-6 h-6 text-white" />
                })()}
              </div>
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-emerald-500"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </motion.div>
            <div>
              <motion.p
                className="text-sm font-medium text-muted-foreground"
                key={`step-${currentStep}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Step {currentStep + 1} of {steps.length}
              </motion.p>
              <motion.h3
                className="text-lg font-semibold text-foreground"
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {steps[currentStep]?.title}
              </motion.h3>
            </div>
          </div>

          {/* Progress percentage */}
          <div className="text-right">
            <motion.span
              className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </motion.span>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Shine effect */}
          <motion.div
            className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['0%', '500%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-between mt-3 px-1">
          {steps.map((_, index) => (
            <motion.button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index < currentStep
                  ? 'bg-emerald-500'
                  : index === currentStep
                    ? 'bg-teal-500 w-4'
                    : 'border-border'
              )}
              whileTap={{ scale: 0.8 }}
              onClick={() =>
                (completedSteps.includes(index) || index <= currentStep) &&
                onStepClick?.(index)
              }
              disabled={!completedSteps.includes(index) && index > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface StepIndicatorProps {
  step: WizardStep
  index: number
  currentStep: number
  isCompleted: boolean
  isClickable: boolean
  onClick: () => void
}

function StepIndicator({
  step,
  index,
  currentStep,
  isCompleted,
  isClickable,
  onClick,
}: StepIndicatorProps) {
  const Icon = STEP_ICONS[step.icon]
  const isActive = index === currentStep
  const isPast = index < currentStep

  return (
    <motion.button
      className={cn(
        'flex flex-col items-center group',
        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={!isClickable}
      whileHover={isClickable ? { scale: 1.05 } : undefined}
      whileTap={isClickable ? { scale: 0.95 } : undefined}
    >
      <motion.div
        className={cn(
          'relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300',
          isActive
            ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/25'
            : isCompleted || isPast
              ? 'bg-emerald-500'
              : 'bg-muted group-hover:border-border'
        )}
        initial={false}
        animate={{
          scale: isActive ? 1.1 : 1,
        }}
      >
        {isCompleted && !isActive ? (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-6 h-6 text-white" />
          </motion.div>
        ) : (
          <Icon
            className={cn(
              'w-5 h-5 transition-colors',
              isActive || isPast || isCompleted
                ? 'text-white'
                : 'text-muted-foreground group-hover:text-muted-foreground'
            )}
          />
        )}

        {/* Active pulse */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-emerald-500"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.div>

      <motion.span
        className={cn(
          'mt-3 text-xs font-medium transition-colors text-center',
          isActive
            ? 'text-emerald-600'
            : isPast || isCompleted
              ? 'text-muted-foreground'
              : 'text-muted-foreground'
        )}
        animate={{
          fontWeight: isActive ? 600 : 500,
        }}
      >
        {step.shortTitle}
      </motion.span>
    </motion.button>
  )
}
