interface Tokens {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  expire_date: number
}

export const authHeaders: Record<string, string> = {
  "Content-Type": "application/json; charset=UTF-8",
}

export const getCredentials = async () => {
  const response = await fetch('https://ntcapi.iett.istanbul/oauth2/v2/auth', {
    method: 'POST',
    headers: {
      'Host': 'ntcapi.iett.istanbul',
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({
      "client_id": "pLwqtobYHTBshBWRrEZdSWsngOywQvHa",
      "client_secret": "JERLUJgaZSygMTqoCtrhrVnvqeVGGVznktlwuOfHqmQTzjnC",
      "grant_type": "client_credentials",
      "scope": "VLCn2qErUdrr1Ehg0yxWObMW9krFb7RC service"
    })
  })
  
  const parsed: Tokens = await response.json()

  authHeaders.Authorization = `Bearer ${parsed.access_token}`

  return parsed
}
