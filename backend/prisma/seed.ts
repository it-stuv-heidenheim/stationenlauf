import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const STATIONS = [
  {
    id: "c3176e44-37df-426c-9597-e65f9ba0fa95",
    name: "DHBW Würfel – Marienstraße 20",
    lat: 48.68186956433014,
    lng: 10.154709643897347,
    description: "Finde den DHBW Würfel und löse alle Aufgaben.",
    tasks: [
      { id: "d94e8876-b7d7-4dbb-9531-9e44919c4aa3", code: "be9fcb69-a207-4c12-a69a-0065576e0f13", label: "StuV Raum, EG M003" },
      { id: "69246847-ff06-4ad7-8bea-9cd9fa14d7ba", code: "703144ca-cef9-4eee-ac85-729798b1c973", label: "International Office, 7.OG M718" },
      { id: "3f9bc6ab-8d3f-443b-a028-64995bdfc9c5", code: "38643fbb-57b2-4fa5-8deb-41a77e13a7a2", label: "Studierndenwerk Ulm, EG Eingangshalle" },
      { id: "cd3ccec5-1d35-41c0-9acd-409ac1c5f860", code: "e00e248f-b550-4acf-82d2-97d5c382dbd8", label: "DHBW Hauptbibliothek, 4.OG M406" },
      { id: "6a08fd3c-7dbb-4587-bb3f-4d091d05aa50", code: "0f8a41ea-b525-4b90-92f9-87ae31cc9c97", label: "DHBW Studienberatung, 7.OG M729" },
        { id: "d3f954af-3ad4-4659-976c-671a274d19ec", code: "fb6dd0e2-fd6a-4cda-a9c5-504265c33f71", label: "Studierendenberatung, M728" },
        { id: "d3f954au-3ad4-4659-976c-671a274d19ec", code: "fb6dd0e5-fd6a-4cda-a9c5-504265c33f71", label: "Druckerraum" },
        { id: "d3f954au-3ad4-4659-976c-671a274d19ec", code: "fb6dd0e5-fd6a-4cda-a9c5-504265c33f71", label: "Mensa" },
        { id: "565153f6-f3da-4971-a82c-66e1e45120fa", code: "35ec9a82-2b78-4fcb-8b87-e385ab17ea02", label: "Ersti Geschenk, EG Aula" },
        { id: "6b3f54d8-0acf-4fc0-ad04-b0c31e0ed817", code: "0205d862-5f7e-40c1-8505-a5607ae96bc6", label: "IG Metall, EG Foyer" },
        { id: "aceb7a6a-5959-44fe-8a73-d258b63e0ada", code: "ec0efab5-baff-4aee-bbf5-85e5f6aaaed0", label: "StuV Wünsch dir was + Speeddating,EG Foyer" },
        { id: "d830dc8c-8a78-4e50-b236-ec7b00edd2ea", code: "6ce9abec-933f-4984-9a1d-26944e070a07", label: "Kulturbüro Heidenheim, EG Foyer" },
        { id: "4a8f4cdd-406a-4886-a3d7-b0180d1b7de7", code: "07edf222-b698-407b-a9b5-edde39de55fc", label: "Kulturbündnis, EG Foyer" },
        { id: "3e92b496-f4c2-42d8-9524-590fc6b77dab", code: "b227641c-1dfa-4c5e-a4cf-d40992725ffb", label: "Amphorenbereich, AUßenbereich" },
    ]
  },

  {
    id: "333e45d6-3670-4966-9922-71044f04ee92",
    name: "Felsen Bar",
    lat: 48.68392021671733,
    lng: 10.154129832887437,
    description: "StuV Bier Pong",
    tasks: [
      { id: "237f195a-59f5-4c66-929e-7d8d035fd916", code: "ea88b15c-a873-42f0-b9e4-310ec888e936", label: "Refresher" }
    ]
  },
  {
    id: "71e569a6-2475-4108-8c31-e6a63b99d39b",
    name: "Schloss Hellenstein",
    lat: 48.67535760029663,
    lng: 10.149484718703066,
    description: "Das Wahrzeichen von Heidenheim",
    tasks: [
      { id: "1e0cbd07-c959-47b2-90ab-507b038eca0f", code: "dff0db60-3186-416f-906f-a329249638b7", label: "Finde eine Kanone" }
    ]
  },
  {
    id: "5666be84-5ad4-47f1-b7eb-0f325cf2e023",
    name: "Eugen-Jaekle-Platz",
    lat: 48.67802849048811,
    lng: 10.152009287136186,
    description: "Finde den Eugen-Jaekle-Platz",
    tasks: [
      { id: "3d21c351-e57b-4f78-b096-d4e3f6941f18", code: "f215c0d1-0d7f-4154-a3d2-09c96f87fa3e", label: "Finde den QR-Code" }
    ]
  },
    {
        id: "5676be84-5ad4-47f1-b7eb-0f325cf2e023",
        name: "Digitalkampus",
        lat: 48.683904800409024,
        lng: 10.155805601698457,
        description: "DHBW Hanns-Voth Campus 1",
        tasks: [
            { id: "3d21c351-e57b-4f78-b096-d4e3f6941f18", code: "f215c0d1-0d7f-4154-a3d2-09c96f87fa3e", label: "Finde die Dachterrasse" },
            { id: "3d21c351-e67b-4f78-b096-d4e3f6941f18", code: "f215c0d1-0d7f-4164-a3d2-09c96f87fa3e", label: "Finde den Automatenraum" }
        ]
    },
    {
        id: "5676be84-5ad4-47f1-b7eb-0f325cf2e023",
        name: "Schlossarkaden",
        lat: 48.680016247193564,
        lng: 10.15327427762719,
        description: "Einkaufsmeile von Heidenheim",
        tasks: [
            { id: "3d21c351-e57b-4f78-b096-d4e3f6951f18", code: "f215c0d1-0d7f-4154-a3d2-09c96f97fa3e", label: "Finde den QR-Code" }
        ]
    }
]

async function main() {
  for (const station of STATIONS) {
    await prisma.station.create({
      data: {
        id: station.id,
        name: station.name,
        lat: station.lat,
        lng: station.lng,
        description: station.description,
        tasks: {
          create: station.tasks.map(task => ({
            id: task.id,
            label: task.label,
            code: task.code
          }))
        }
      }
    })
  }
}

main()
  .then(async () => {
    console.log("Seed complete")
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
