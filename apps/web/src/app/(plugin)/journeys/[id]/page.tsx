import { JourneyCanvas } from '@/components/journeys/journey-canvas'

export default function JourneyPage({ params }: { params: { id: string } }) {
  return <JourneyCanvas journeyId={params.id} />
}
