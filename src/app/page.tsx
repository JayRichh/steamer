import { Card } from "~/components/ui/Card";
import { Container } from "~/components/ui/Container";
import { GradientBackground } from "~/components/ui/GradientBackground";
import { Text } from "~/components/ui/Text";

export default function HomePage() {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <GradientBackground className="absolute inset-0 -z-10" />

        <div className="text-center max-w-3xl mx-auto">
          <Text variant="h1" className="mb-6">
            Your Steam Experience, Enhanced
          </Text>
          <Text className="text-xl mb-12 text-gray-600 dark:text-gray-300">
            Connect with Steam to explore your gaming world in a new way. View screenshots, track
            friends, and see your gaming activity all in one place.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-8">
          <Card className="p-6">
            <Text variant="h3" className="mb-4">
              Screenshot Gallery
            </Text>
            <Text>
              Browse and organize your Steam screenshots in a beautiful gallery. Share your gaming
              moments easily.
            </Text>
          </Card>

          <Card className="p-6">
            <Text variant="h3" className="mb-4">
              Friend Activity
            </Text>
            <Text>
              See what your friends are playing in real-time. Track their gaming status and current
              activities.
            </Text>
          </Card>

          <Card className="p-6">
            <Text variant="h3" className="mb-4">
              Gaming Stats
            </Text>
            <Text>Track your recent games and playtime. Get insights into your gaming habits.</Text>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <Text className="text-gray-500 dark:text-gray-400 mb-4">Powered by Steam Web API</Text>
          <Text className="text-sm text-gray-400 dark:text-gray-500">
            Login with your Steam account to get started. Your data is securely handled through
            Steam's official authentication.
          </Text>
        </div>
      </div>
    </Container>
  );
}
