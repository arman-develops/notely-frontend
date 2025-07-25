import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Card, CardContent, Stepper, Step, StepLabel, Fade, Slide } from "@mui/material"
import { useAuthStore } from "../store/AuthStore"
import WelcomeStep from "../components/onboarding/Welcome"
import PreferencesStep from "../components/onboarding/Preferences"
import ProfileStep from "../components/onboarding/ProfileSetup"
import FirstNoteStep from "../components/onboarding/FirstNote"

const steps = ["Welcome", "Profile", "Preferences", "First Note"]

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const { user, updateUser, completeOnboarding } = useAuthStore()

  const [activeStep, setActiveStep] = useState(0)
  const [preferences, setPreferences] = useState<string[]>([])
  const [profileData, setProfileData] = useState({
    bio: "",
    avatar: "",
  })

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Complete onboarding
      completeOnboarding(preferences)
      updateUser(profileData)
      navigate("/dashboard")
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <WelcomeStep user={user} onNext={handleNext} />
      case 1:
        return (
          <ProfileStep
            profileData={profileData}
            onProfileChange={setProfileData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 2:
        return (
          <PreferencesStep
            preferences={preferences}
            onPreferencesChange={setPreferences}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return <FirstNoteStep onNext={handleNext} onBack={handleBack} />
      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Fade in timeout={800}>
        <Card
          sx={{
            maxWidth: 600,
            width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            borderRadius: 3,
            minHeight: 500,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box mb={4}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Slide direction="left" in mountOnEnter unmountOnExit>
              <Box>{renderStep()}</Box>
            </Slide>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  )
}
