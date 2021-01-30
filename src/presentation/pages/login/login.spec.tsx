import 'jest-localstorage-mock'

import faker from 'faker'
import React from 'react'

import { InvalidCredentialsError } from '@/domain/errors'
import { AuthenticationSpy, ValidationStub } from '@/presentation/test'
import {
  cleanup,
  fireEvent,
  render,
  RenderResult,
  waitFor,
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

const populateEmailField = (
  sut: RenderResult,
  email = faker.internet.email()
): void => {
  const { getByTestId } = sut
  const emailInput = getByTestId('email')
  fireEvent.input(emailInput, {
    target: { value: email },
  })
}

const populatePasswordField = (
  sut: RenderResult,
  password = faker.internet.password()
): void => {
  const { getByTestId } = sut
  const passwordInput = getByTestId('password')
  fireEvent.input(passwordInput, {
    target: { value: password },
  })
}

const simulateValidSubmit = (
  sut: RenderResult,
  email = faker.internet.email(),
  password = faker.internet.password()
): void => {
  const { getByTestId } = sut
  populateEmailField(sut, email)
  populatePasswordField(sut, password)

  const submitButton = getByTestId('submit')
  fireEvent.click(submitButton)
}

const simulateStatusForField = (
  sut: RenderResult,
  fieldName: string,
  validationError?: string
): void => {
  const { getByTestId } = sut
  const fieldStatus = getByTestId(`${fieldName}-status`)
  expect(fieldStatus.title).toBe(validationError || 'Tudo certo!')
  expect(fieldStatus.textContent).toBe(validationError ? '🔴' : '🟢')
}

describe('Login Component', () => {
  beforeEach(() => localStorage.clear())
  afterEach(cleanup)

  test('Should start with initial state', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })
    const { getByTestId } = sut

    const errorWrap = getByTestId('error-wrap')
    expect(errorWrap.childElementCount).toBe(0)

    const submitButton = getByTestId('submit') as HTMLButtonElement
    expect(submitButton.disabled).toBe(true)

    simulateStatusForField(sut, 'email', validationError)
    simulateStatusForField(sut, 'password', validationError)
  })

  test('Should show email error if validation fails', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })

    populateEmailField(sut)
    simulateStatusForField(sut, 'email', validationError)
  })

  test('Should show password error if validation fails', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })

    populatePasswordField(sut)
    simulateStatusForField(sut, 'password', validationError)
  })

  test('Should show valid email if Validation succeeds', () => {
    const { sut } = makeSut()

    populateEmailField(sut)
    simulateStatusForField(sut, 'email')
  })

  test('Should show valid password if Validation succeeds', () => {
    const { sut } = makeSut()

    populatePasswordField(sut)
    simulateStatusForField(sut, 'password')
  })

  test('Should enable submit button if form is valid', () => {
    const { sut } = makeSut()
    const { getByTestId } = sut

    populateEmailField(sut)
    populatePasswordField(sut)

    const submitButton = getByTestId('submit') as HTMLButtonElement
    expect(submitButton.disabled).toBe(false)
  })

  test('Should show spinner on submit', () => {
    const { sut } = makeSut()
    const { getByTestId } = sut

    simulateValidSubmit(sut)

    const spinner = getByTestId('spinner')
    expect(spinner).toBeTruthy()
  })

  test('Should call Authentication with correct values', () => {
    const { sut, authenticationSpy } = makeSut()
    const email = faker.internet.email()
    const password = faker.internet.password()

    simulateValidSubmit(sut, email, password)

    expect(authenticationSpy.params).toEqual({
      email,
      password,
    })
  })

  test('Should call Authentication only once', () => {
    const { sut, authenticationSpy } = makeSut()
    simulateValidSubmit(sut)
    simulateValidSubmit(sut)
    expect(authenticationSpy.callsCount).toBe(1)
  })

  test('Should not call Authentication if form is invalid', () => {
    const validationError = faker.random.words()
    const { sut, authenticationSpy } = makeSut({ validationError })
    const { getByTestId } = sut
    populateEmailField(sut)
    fireEvent.submit(getByTestId('form'))
    expect(authenticationSpy.callsCount).toBe(0)
  })

  test('Should present error if Authentication fails', async () => {
    const { sut, authenticationSpy } = makeSut()
    const { getByTestId } = sut
    const error = new InvalidCredentialsError()
    jest
      .spyOn(authenticationSpy, 'auth')
      .mockReturnValueOnce(Promise.reject(error))

    simulateValidSubmit(sut)
    const errorWrap = getByTestId('error-wrap')

    await waitFor(() => errorWrap)

    const mainError = getByTestId('main-error')
    expect(mainError.textContent).toBe(error.message)

    expect(errorWrap.childElementCount).toBe(1)
  })

  test('Should add accessToken to localstorage on success', async () => {
    const { sut, authenticationSpy } = makeSut()
    const { getByTestId } = sut
    simulateValidSubmit(sut)

    await waitFor(() => getByTestId('form'))

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'accessToken',
      authenticationSpy.account.accessToken
    )
  })
})
