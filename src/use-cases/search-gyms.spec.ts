import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { SearchGymUseCase } from './search-gyms'
import { Decimal } from '@prisma/client/runtime/library'

let gymsRepository: InMemoryGymsRepository
let sut: SearchGymUseCase

describe('Search gym use case', () => {
  beforeEach(async () => {
    gymsRepository = new InMemoryGymsRepository()
    sut = new SearchGymUseCase(gymsRepository)
  })

  it('should be able to search for gyms', async () => {
    await gymsRepository.create({
      id: 'gym-1',
      title: 'js gym',
      description: null,
      phone: null,
      latitude: new Decimal(-22.3417378),
      longitude: new Decimal(-47.338267),
    })

    await gymsRepository.create({
      id: 'gym-2',
      title: 'ts gym',
      description: null,
      phone: null,
      latitude: new Decimal(-22.3417378),
      longitude: new Decimal(-47.338267),
    })

    const { gyms } = await sut.execute({
      query: 'js',
      page: 1,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms).toEqual([expect.objectContaining({ title: 'js gym' })])
  })

  it('should be able to fetch paginated gyms search', async () => {
    for (let i = 1; i <= 22; i++) {
      await gymsRepository.create({
        id: `gym-${i}`,
        title: `js gym ${i}`,
        description: null,
        phone: null,
        latitude: new Decimal(-22.3417378),
        longitude: new Decimal(-47.338267),
      })
    }

    const { gyms } = await sut.execute({
      query: 'js',
      page: 2,
    })

    expect(gyms).toHaveLength(2)
    expect(gyms).toEqual([
      expect.objectContaining({
        title: 'js gym 21',
      }),
      expect.objectContaining({
        title: 'js gym 22',
      }),
    ])
  })
})
