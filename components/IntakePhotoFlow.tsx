"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PHOTO_TYPE_LABELS, type VehiclePhoto, type VehiclePhotoType } from "@/lib/photos";

export type IntakeStep = {
  id: string;
  title: string;
  description: string;
  type: VehiclePhotoType;
  requiredCount?: number;
  tips?: string[];
};

export type IntakePhotoFlowProps = {
  vehicleId: string;
  steps?: IntakeStep[];
  initialPhotosByStep?: Record<string, VehiclePhoto[]>;
  onComplete?: (photosByStep: Record<string, VehiclePhoto[]>) => void;
  className?: string;
};

const DEFAULT_STEPS: IntakeStep[] = [
  {
    id: "arrival-walkaround",
    title: "Arrival walkaround",
    description: "Four-corner walkaround showing overall condition, stance, and fitment.",
    type: "intake",
    requiredCount: 2,
    tips: ["Frame the entire vehicle", "Capture both driver + passenger sides"],
  },
  {
    id: "detail-condition",
    title: "Condition details",
    description: "Close-ups of any pre-existing imperfections, paint chips, or wheel rash.",
    type: "condition",
    requiredCount: 2,
    tips: ["Zoom tight so defects are obvious", "Note the location in the comment field"],
  },
  {
    id: "interior",
    title: "Interior touchpoints",
    description: "Seats, wheel, shifter, odometer, and anything unique inside.",
    type: "condition",
    requiredCount: 1,
    tips: ["Open the door fully", "Turn on interior lights if needed"],
  },
];

export function IntakePhotoFlow({
  vehicleId,
  steps = DEFAULT_STEPS,
  initialPhotosByStep,
  onComplete,
  className,
}: IntakePhotoFlowProps) {
  const initialState = useMemo(() => {
    return steps.reduce<Record<string, VehiclePhoto[]>>((acc, step) => {
      acc[step.id] = initialPhotosByStep?.[step.id] ?? [];
      return acc;
    }, {});
  }, [initialPhotosByStep, steps]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadsByStep, setUploadsByStep] = useState<Record<string, VehiclePhoto[]>>(initialState);

  useEffect(() => {
    setUploadsByStep(initialState);
  }, [initialState]);

  const currentStep = steps[currentIndex];
  const totalSteps = steps.length;
  const requiredCount = currentStep.requiredCount ?? 1;
  const currentPhotos = uploadsByStep[currentStep.id] ?? [];
  const completedSteps = steps.filter((step) => (uploadsByStep[step.id]?.length ?? 0) >= (step.requiredCount ?? 1)).length;
  const progressRatio = totalSteps ? completedSteps / totalSteps : 0;
  const canAdvance = currentPhotos.length >= requiredCount;
  const atFinalStep = currentIndex === totalSteps - 1;

  const handleUploaded = useCallback(
    (photos: VehiclePhoto[]) => {
      setUploadsByStep((prev) => {
        const existing = prev[currentStep.id] ?? [];
        return {
          ...prev,
          [currentStep.id]: [...photos, ...existing],
        };
      });
    },
    [currentStep.id]
  );

  const handleDelete = useCallback(
    async (photo: VehiclePhoto) => {
      const response = await fetch(`/api/photos/${photo.vehicleId}?key=${encodeURIComponent(photo.storageKey)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = (await response.json().catch(() => null))?.error ?? "Unable to delete photo";
        throw new Error(message);
      }

      setUploadsByStep((prev) => {
        const existing = prev[currentStep.id] ?? [];
        return {
          ...prev,
          [currentStep.id]: existing.filter((item) => item.storageKey !== photo.storageKey),
        };
      });
    },
    [currentStep.id]
  );

  const goToStep = (index: number) => {
    if (index < 0 || index >= totalSteps) return;
    setCurrentIndex(index);
  };

  const advance = () => {
    if (atFinalStep) {
      onComplete?.(uploadsByStep);
    } else {
      goToStep(currentIndex + 1);
    }
  };

  return (
    <section className={clsx("nsc-intake-flow", className)}>
      <header className="nsc-intake-flow__header">
        <div>
          <p className="nsc-eyebrow">Intake checklist</p>
          <h2 className="nsc-heading nsc-heading--lg">Condition capture</h2>
          <p className="nsc-body--muted">
            Step through the baseline photo set so members always know how their vehicle arrived on site.
          </p>
        </div>
        <div className="nsc-intake-flow__progress">
          <div className="nsc-progress-bar" aria-hidden="true">
            <span style={{ width: `${Math.round(progressRatio * 100)}%` }} />
          </div>
          <p>
            {completedSteps}/{totalSteps} steps complete
          </p>
        </div>
      </header>

      <div className="nsc-intake-flow__body">
        <aside className="nsc-intake-flow__steps" aria-label="Intake steps">
          {steps.map((step, index) => {
            const stepPhotos = uploadsByStep[step.id]?.length ?? 0;
            const stepRequired = step.requiredCount ?? 1;
            const status = stepPhotos >= stepRequired ? "done" : index === currentIndex ? "current" : "pending";

            return (
              <button
                key={step.id}
                type="button"
                className={clsx("nsc-intake-step", `nsc-intake-step--${status}`)}
                onClick={() => goToStep(index)}
                aria-current={index === currentIndex ? "step" : undefined}
              >
                <span className="nsc-intake-step__order">{index + 1}</span>
                <div>
                  <p className="nsc-intake-step__title">{step.title}</p>
                  <p className="nsc-intake-step__meta">
                    {PHOTO_TYPE_LABELS[step.type]} · {stepPhotos}/{stepRequired} photos
                  </p>
                </div>
                {status === "done" && <CheckCircle2 size={16} className="nsc-intake-step__check" />}
              </button>
            );
          })}
        </aside>

        <div className="nsc-intake-flow__content">
          <div className="nsc-intake-step__intro">
            <p className="nsc-eyebrow">Step {currentIndex + 1} of {totalSteps} — {PHOTO_TYPE_LABELS[currentStep.type]}</p>
            <h3 className="nsc-heading">{currentStep.title}</h3>
            <p className="nsc-body--muted">{currentStep.description}</p>
            {currentStep.tips?.length ? (
              <ul className="nsc-intake-tips">
                {currentStep.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <PhotoUpload
            vehicleId={vehicleId}
            allowedTypes={[currentStep.type]}
            hideTypePicker
            eyebrow="Capture"
            title={`Add ${PHOTO_TYPE_LABELS[currentStep.type].toLowerCase()} photos`}
            description={`Drop shots for ${currentStep.title.toLowerCase()}. ${requiredCount} required.`}
            onUploaded={handleUploaded}
          />

          {currentPhotos.length ? (
            <PhotoGallery
              photos={currentPhotos}
              canDelete
              onDelete={handleDelete}
              className="nsc-intake-gallery"
            />
          ) : (
            <div className="nsc-intake-gallery nsc-intake-gallery--empty">
              <p>No photos captured for this step yet.</p>
            </div>
          )}

          <div className="nsc-intake-flow__actions">
            <button
              type="button"
              className="nsc-intake-btn nsc-intake-btn--ghost"
              onClick={() => goToStep(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="nsc-intake-btn"
              onClick={advance}
              disabled={!canAdvance}
            >
              {atFinalStep ? (
                <>
                  Mark intake complete
                  <CheckCircle2 size={16} />
                </>
              ) : (
                <>
                  Next step
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const flowStyles = `
.nsc-intake-flow {
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(var(--border-rgb), 0.5);
  padding: var(--space-6);
  background: radial-gradient(circle at top right, rgba(var(--surface3-rgb), 0.8), rgba(var(--surface-rgb), 0.5));
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.nsc-intake-flow__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-4);
}

.nsc-intake-flow__progress {
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--muted);
}

.nsc-progress-bar {
  width: 100%;
  height: 6px;
  border-radius: var(--radius-pill);
  background: rgba(var(--text-rgb), 0.15);
  overflow: hidden;
}

.nsc-progress-bar span {
  display: block;
  height: 100%;
  background: var(--grad-blue);
}

.nsc-intake-flow__body {
  display: grid;
  grid-template-columns: minmax(220px, 320px) 1fr;
  gap: var(--space-6);
}

.nsc-intake-flow__steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nsc-intake-step {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(var(--border-rgb), 0.5);
  background: rgba(var(--surface3-rgb), 0.5);
  padding: var(--space-3);
  text-align: left;
  transition: border-color var(--duration-base) var(--easing-soft);
}

.nsc-intake-step--current {
  border-color: rgba(var(--blue-rgb), 0.7);
  background: rgba(var(--blue-rgb), 0.12);
}

.nsc-intake-step--done {
  opacity: 0.85;
}

.nsc-intake-step__order {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: rgba(var(--surface-rgb), 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.nsc-intake-step__title {
  font-weight: 600;
}

.nsc-intake-step__meta {
  font-size: 0.85rem;
  color: var(--muted);
}

.nsc-intake-step__check {
  margin-left: auto;
  color: var(--blue);
}

.nsc-intake-flow__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.nsc-intake-step__intro {
  border-radius: var(--radius-xl);
  border: 1px solid rgba(var(--border-rgb), 0.4);
  padding: var(--space-4);
  background: rgba(var(--surface2-rgb), 0.7);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nsc-intake-tips {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.nsc-intake-gallery {
  border-radius: var(--radius-xl);
  border: 1px dashed rgba(var(--border-rgb), 0.5);
  padding: var(--space-4);
  background: rgba(var(--surface-rgb), 0.4);
}

.nsc-intake-gallery--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

.nsc-intake-flow__actions {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
}

.nsc-intake-btn {
  border-radius: var(--radius-pill);
  border: 1px solid rgba(var(--blue-rgb), 0.6);
  background: rgba(var(--blue-rgb), 0.2);
  padding: 0.85rem 1.5rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.nsc-intake-btn--ghost {
  border-color: rgba(var(--border-rgb), 0.6);
  background: transparent;
}

.nsc-intake-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .nsc-intake-flow__body {
    grid-template-columns: 1fr;
  }
}
`;

if (typeof document !== "undefined" && !document.getElementById("nsc-intake-flow-styles")) {
  const style = document.createElement("style");
  style.id = "nsc-intake-flow-styles";
  style.innerHTML = flowStyles;
  document.head.appendChild(style);
}
