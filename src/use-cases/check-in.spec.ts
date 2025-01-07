import { expect, describe, it, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins'
import { MaxDistanceError } from './errors/max-distance-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check in use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    await gymsRepository.create({
      id: 'gym-1',
      title: 'js gym',
      description: '',
      phone: '',
      latitude: new Decimal(-22.3417378),
      longitude: new Decimal(-47.338267),
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      userId: 'user-1',
      gymId: 'gym-1',
      userLatitude: -22.3417378,
      userLongitude: -47.338267,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice on the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-1',
      userId: 'id-1',
      userLatitude: -22.3417378,
      userLongitude: -47.338267,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-1',
        userId: 'id-1',
        userLatitude: -22.3417378,
        userLongitude: -47.338267,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should not be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-1',
      userId: 'id-1',
      userLatitude: -22.3417378,
      userLongitude: -47.338267,
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-1',
      userId: 'id-1',
      userLatitude: -22.3417378,
      userLongitude: -47.338267,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distant gym', async () => {
    gymsRepository.items.push({
      id: 'gym-2',
      title: 'js gym',
      description: '',
      phone: '',
      latitude: new Decimal(-22.3417378),
      longitude: new Decimal(-47.338267),
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-2',
        userId: 'id-1',
        userLatitude: -22.3693616,
        userLongitude: -47.3788698,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
