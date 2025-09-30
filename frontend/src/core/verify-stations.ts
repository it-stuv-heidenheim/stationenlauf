const verifyStation = async (stationId: string, code: string, user: string) => {
  const res = await fetch(`http://localhost:5173/api/v1/stations/${stationId}/complete`, {
    method: "POST",
    body: JSON.stringify({user: user, code: code}),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.success
}

export default verifyStation
