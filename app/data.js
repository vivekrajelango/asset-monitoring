export const rawData = [
  {
    id: 100000,
    name: "Asset 1",
    type: "A",
    description: "This is a type A asset",
    attributes: [
      { key: "isMonitored", value: "true" },
      { key: "OS Version", value: "1.2.3" },
      { key: "Voltage", value: "855.23" },
    ],
    children: [
      {
        id: 100004,
        name: "Asset 4",
        type: "B",
        children: [
          {
            id: 100020,
            name: "Asset 20",
            type: "C",
            children: [
              {
                id: 100030,
                name: "Asset 30",
                type: "D",
                attributes: [
                  { key: "power", value: "40" },
                  { key: "material", value: "plastic" },
                ],
              },
            ],
          },
          {
            id: 100031,
            name: "Asset 31",
            type: "D",
            description: "this is asset of type D",
          },
        ],
      },
    ],
  },
  {
    id: 100002,
    name: "Asset 2",
    type: "A",
  },
  {
    id: 100003,
    name: "Asset 3",
    type: "B",
    children: [
      {
        id: 100050,
        name: "Asset 50",
        type: "C",
      },
      {
        id: 100051,
        name: "Asset 51",
        type: "C",
        attributes: [{ key: "isMonitored", value: "true" }],
      },
      {
        id: 100052,
        name: "Asset 52",
        type: "D",
        children: {
          id: 100055,
          name: "Asset 55",
          type: "E",
        },
      },
    ],
  },
];