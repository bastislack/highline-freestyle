type OnboardTipKey = 'SetFavorite';

export function onboardingTipHasBeenShown(tipKey: OnboardTipKey) {
  const full_key = `ONBOARDING_HAS_BEEN_SHOWN_${tipKey}`;
  return window.localStorage.getItem(full_key) !== null;
}

export function setOnboardingTipAsShown(tipKey: OnboardTipKey) {
  const full_key = `ONBOARDING_HAS_BEEN_SHOWN_${tipKey}`;
  window.localStorage.setItem(full_key, 'true');
}
