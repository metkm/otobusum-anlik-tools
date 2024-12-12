const extractInnerContentXml = (key, content) => {
  return content.split(`${key}>`).at(1)?.split(`</`).at(0)
}

const getBody = (key, outerKey, content) => `
<soap:Envelope
	xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
	<soap:Body>
		<${outerKey}
			xmlns="http://tempuri.org/">
			<${key}>${content}</${key}>
		</${outerKey}>
	</soap:Body>
</soap:Envelope>
`

const getStops = async () => {
  const body = getBody('DurakKodu', 'GetDurak_json', '')

  const response = await fetch("https://api.ibb.gov.tr/iett/UlasimAnaVeri/HatDurakGuzergah.asmx?wsdl", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=UTF-8",
      SOAPAction: '"http://tempuri.org/GetDurak_json"',
    },
    body,
  });

  const text = await response.text()
  return text
};

const getBusLocations = async () => {
  const body = getBody('HatKodu', 'GetHatOtoKonum_json', '50F')

  const response = await fetch('https://api.ibb.gov.tr/iett/FiloDurum/SeferGerceklesme.asmx', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=UTF-8',
      'SOAPAction': '"http://tempuri.org/GetHatOtoKonum_json"',
    },
    body,
  })

  const key = 'GetHatOtoKonum_jsonResult'
  const content = await response.text()

  const innerContent = extractInnerContentXml(key, content)
  if (!innerContent) return []

  const responseParsed = JSON.parse(innerContent)
  return responseParsed
};

const getTest = async () => {
  const key = 'GetGuzergahLine_json'
  const body = getBody('HatKodu', key, 'KM12')

  const response = await fetch("https://api.ibb.gov.tr/iett/UlasimAnaVeri/HatDurakGuzergah.asmx", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=UTF-8",
      SOAPAction: `"http://tempuri.org/${key}"`,
    },
    body,
  });

  const content = await response.text()
  console.log(content)
}

getTest()
