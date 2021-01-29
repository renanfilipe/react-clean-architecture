import faker from 'faker'
import React from 'react'

import { AuthenticationSpy, ValidationStub } from '@/presentation/test'
import {
  cleanup,
  fireEvent,
  render,
  RenderResult,
} from '@testing-library/react'

import Login from './login'

type SutTypes = {
  sut: RenderResult
  authenticationSpy: AuthenticationSpy
}

type SutParams = {
  validationError: string
}

const makeSut = (params?: SutParams): SutTypes => {
  const validationStub = new ValidationStub()
  const authenticationSpy = new AuthenticationSpy()
  validationStub.errorMessage = params?.validationError

  const sut = render(
    <Login validation={validationStub} authentication={authenticationSpy} />
  )

  return {
    sut,
    authenticationSpy,
  }
}

describe('Login Component', () => {
  afterEach(cleanup)

  test('Should start with initial state', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })
    const { getByTestId } = sut

    const errorWrap = getByTestId('error-wrap')
    expect(errorWrap.childElementCount).toBe(0)

    const submitButton = getByTestId('submit') as HTMLButtonElement
    expect(submitButton.disabled).toBe(true)

    const emailStatus = getByTestId('email-status')
    expect(emailStatus.title).toBe(validationError)
    expect(emailStatus.textContent).toBe('🔴')

    const passwordStatus = getByTestId('password-status')
    expect(passwordStatus.title).toBe(validationError)
    expect(passwordStatus.textContent).toBe('🔴')
  })

  test('Should show email error if validation fails', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })
    const { getByTestId } = sut

    const emailInput = getByTestId('email')
    fireEvent.input(emailInput, { target: { value: faker.internet.email() } })
    const emailStatus = getByTestId('email-status')

    expect(emailStatus.title).toBe(validationError)
    expect(emailStatus.textContent).toBe('🔴')
  })

  test('Should show password error if validation fails', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })
    const { getByTestId } = sut

    const passwordInput = getByTestId('password')
    fireEvent.input(passwordInput, {
      target: { value: faker.internet.password() },
    })
    const passwordStatus = getByTestId('password-status')

    expect(passwordStatus.title).toBe(validationError)
    expect(passwordStatus.textContent).toBe('🔴')
  })

  test('Should show valid email if Validation succeeds', () => {
    const { sut } = makeSut()
    const { getByTestId } = sut

    const emailInput = getByTestId('email')
    fireEvent.input(emailInput, {
      target: { value: faker.internet.email() },
    })
    const emailStatus = getByTestId('email-status')

    expect(emailStatus.title).toBe('Tudo certo')
    expect(emailStatus.textContent).toBe('🟢')
  })

  test('Should show valid password if Validation succeeds', () => {
    const { sut } = makeSut()
    const { getByTestId } = sut

    const passwordInput = getByTestId('password')
    fireEvent.input(passwordInput, {
      target: { value: faker.internet.password() },
    })
    const passwordStatus = getByTestId('password-status')

    expect(passwordStatus.title).toBe('Tudo certo')
    expect(passwordStatus.textContent).toBe('🟢')
  })

  test('Should enable submit button if form is valid', () => {
    const { sut } = makeSut()
    const { getByTestId } = sut

    const emailInput = getByTestId('email')
    fireEvent.input(emailInput, {
      target: { value: faker.internet.email() },
    })

    const passwordInput = getByTestId('password')
    fireEvent.input(passwordInput, {
      target: { value: faker.internet.password() },
    })

    const submitButton = getByTestId('submit') as HTMLButtonElement
    expect(submitButton.disabled).toBe(false)
  })

  test('Should show spinner on submit', () => {
    const { sut } = makeSut()
    const { getByTestId } = sut

    const emailInput = getByTestId('email')
    fireEvent.input(emailInput, {
      target: { value: faker.internet.email() },
    })

    const passwordInput = getByTestId('password')
    fireEvent.input(passwordInput, {
      target: { value: faker.internet.password() },
    })

    const submitButton = getByTestId('submit')
    fireEvent.click(submitButton)

    const spinner = getByTestId('spinner')
    expect(spinner).toBeTruthy()
  })

  test('Should call Authentication with correct values', () => {
    const { sut, authenticationSpy } = makeSut()
    const { getByTestId } = sut

    const emailInput = getByTestId('email')
    const email = faker.internet.email()
    fireEvent.input(emailInput, {
      target: { value: email },
    })

    const passwordInput = getByTestId('password')
    const password = faker.internet.password()
    fireEvent.input(passwordInput, {
      target: { value: password },
    })

    const submitButton = getByTestId('submit')
    fireEvent.click(submitButton)

    expect(authenticationSpy.params).toEqual({
      email,
      password,
    })
  })
})
