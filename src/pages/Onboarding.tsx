import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Card, CardContent, Stepper, Step, StepLabel, Fade, Slide } from "@mui/material"
import { useAuthStore } from "../store/AuthStore"
import WelcomeStep from "../components/onboarding/Welcome"
import PreferencesStep from "../components/onboarding/Preferences"
import ProfileStep from "../components/onboarding/ProfileSetup"
import FirstNoteStep from "../components/onboarding/FirstNote"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"

const steps = ["Welcome", "Profile", "Preferences", "First Note"]

interface OnboardingData {
  bio?: string
  avatar?: string
  preferences: string[]
  firstNote?: {
    title: string
    content: string
    category: string
  }
}

interface OnboardingResponse {
  user: {
    id: string
    firstName: string
    lastName: string
    username: string
    email: string
    preferences: string[]
    hasCompletedOnboarding: boolean
    bio?: string
    avatar?: string
  }
  message?: string
}

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const { user, updateUser, setError, setLoading, clearError } = useAuthStore()

  const [activeStep, setActiveStep] = useState(0)
  const [preferences, setPreferences] = useState<string[]>([])
  const [profileData, setProfileData] = useState({
    bio: "",
    avatar: "",
  })
  const [firstNote, setFirstNote] = useState({
    title: "",
    content: "",
    category: "",
    synopsis: ""
  })

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData): Promise<OnboardingResponse> => {
      const response = await axiosInstance.patch("/auth/onboarding", data)
      return response.data.data
    },
    onMutate: () => {
      setLoading(true)
      clearError()
    },
    onSuccess: (data: OnboardingResponse) => {
      console.log("Onboarding complete", data)
      updateUser({
        ...data.user,
        hasCompletedOnboarding: true
      })
      navigate("/app/dashboard")
    },
    onError: (error: any) => {
      console.error("Onboarding completion error:", error)

      let errorMessage = "Failed to complete onboarding. Please try again."

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid onboarding data. Please check your information."
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later."
      } else if (error.message === "Network Error") {
        errorMessage = "Network error. Please check your connection."
      }

      setError(errorMessage)
      setLoading(false)
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Complete onboarding and send data to backend
      const onboardingData: OnboardingData = {
        bio: profileData.bio,
        avatar: profileData.avatar,
        preferences,
        firstNote: firstNote.title && firstNote.content ? firstNote: undefined
      }
      completeOnboardingMutation.mutate(onboardingData)
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
        return (
          <FirstNoteStep
            noteData={firstNote}
            onNoteChange={setFirstNote}
            onNext={handleNext}
            onBack={handleBack}
            isLoading={completeOnboardingMutation.isPending}
          />
        )
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
