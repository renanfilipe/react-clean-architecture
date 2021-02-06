import { InvalidFieldError } from '@/validation/errors'
import { FieldValidation } from '@/validation/protocols'

export class EmailValidation implements FieldValidation {
  constructor(readonly fieldName: string) {}

  validate(value: string): Error {
    return new InvalidFieldError()
  }
}
