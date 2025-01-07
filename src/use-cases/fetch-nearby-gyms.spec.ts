import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms'

let gymsRepository: InMemoryGymsRepository
let sut: FetchNearbyGymsUseCase

describe('Fetch nearby gyms use case', () => {
  beforeEach(async () => {
    gymsRepository = new InMemoryGymsRepository()
    sut = new FetchNearbyGymsUseCase(gymsRepository)
  })

  it('should be able to fetch nearby gyms', async () => {
    await gymsRepository.create({
      id: 'gym-1',
      title: 'near gym',
      description: null,
      phone: null,
      latitude: new Decimal(-22.3417378),
      longitude: new Decimal(-47.338267),
    })

    await gymsRepository.create({
      id: 'gym-2',
      title: 'distant gym',
      description: null,
      phone: null,
      latitude: new Decimal(-22.4455999),
      longitude: new Decimal(-46.8418534),
    })

    const { gyms } = await sut.execute({
      userLatitude: -22.3417378,
      userLongitude: -47.338267,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms).toEqual([expect.objectContaining({ title: 'near gym' })])
  })
})
