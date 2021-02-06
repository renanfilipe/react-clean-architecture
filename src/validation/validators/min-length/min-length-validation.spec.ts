import faker from 'faker'

import { InvalidFieldError } from '@/validation/errors'

import { MinLengthValidation } from './min-length-validation'

const makeSut = (): MinLengthValidation =>
  new MinLengthValidation(faker.database.column(), 5)

describe('MinLengthValidation', () => {
  test('should return error if length is invalid', () => {
    const sut = makeSut()
    const error = sut.validate(faker.random.alphaNumeric(4))
    expect(error).toEqual(new InvalidFieldError())
  })

  test('should return falsy if length is valid', () => {
    const sut = makeSut()
    const error = sut.validate(faker.random.alphaNumeric(5))
    expect(error).toBeFalsy()
  })
})
