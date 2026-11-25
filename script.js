const professionals = [
  { id: "ana", name: "Ana", initial: "A" },
  { id: "lucia", name: "Lucía", initial: "L" },
  { id: "sofia", name: "Sofía", initial: "S" }
];

const sampleAppointments = {
  0: [
    { professional: "ana", start: "09:30", duration: 60, client: "Carla Méndez", service: "Corte y brushing", status: "confirmed" },
    { professional: "lucia", start: "10:00", duration: 90, client: "Micaela Ruiz", service: "Manicuría", status: "confirmed" },
    { professional: "sofia", start: "11:00", duration: 60, client: "Paula Díaz", service: "Limpieza facial", status: "pending" }
  ],
  1: [
    { professional: "ana", start: "09:00", duration: 60, client: "Julia Castro", service: "Corte", status: "confirmed" },
    { professional: "lucia", start: "10:00", duration: 60, client: "Natalia Vera", service: "Manicuría", status: "confirmed" },
    { professional: "sofia", start: "11:30", duration: 90, client: "Marina Paz", service: "Masaje relajante", status: "pending" }
  ],
  2: [
    { professional: "ana", start: "09:30", duration: 60, client: "María López", service: "Corte", status: "confirmed" },
    { professional: "ana", start: "11:00", duration: 90, client: "Lucía Fernández", service: "Color y brushing", status: "confirmed" },
    { professional: "lucia", start: "10:00", duration: 60, client: "Camila Soto", service: "Manicuría", status: "pending" },
    { professional: "lucia", start: "12:00", duration: 60, client: "Julieta Ríos", service: "Esmaltado", status: "confirmed" },
    { professional: "sofia", start: "09:00", duration: 90, client: "Agustina Rey", service: "Limpieza facial", status: "confirmed" },
    { professional: "sofia", start: "11:00", duration: 60, client: "Valentina Sol", service: "Masaje", status: "confirmed" }
  ],
  3: [
    { professional: "ana", start: "10:00", duration: 90, client: "Rocío Vidal", service: "Color", status: "pending" },
    { professional: "lucia", start: "09:30", duration: 60, client: "Florencia Gil", service: "Manicuría", status: "confirmed" },
    { professional: "sofia", start: "11:00", duration: 60, client: "Cecilia León", service: "Limpieza facial", status: "confirmed" }
  ],
  4: [
    { professional: "ana", start: "09:00", duration: 90, client: "Belén Ortiz", service: "Corte y brushing", status: "confirmed" },
    { professional: "lucia", start: "10:30", duration: 60, client: "Emilia Paz", service: "Manicuría", status: "pending" },
    { professional: "sofia", start: "09:30", duration: 90, client: "Daniela Cruz", service: "Masaje", status: "confirmed" }
  ],
  5: [
    { professional: "ana", start: "10:00", duration: 60, client: "Milagros Núñez", service: "Corte", status: "confirmed" },
    { professional: "lucia", start: "09:00", duration: 90, client: "Abril Molina", service: "Manicuría", status: "confirmed" },
    { professional: "sofia", start: "11:30", duration: 60, client: "Lara Suárez", service: "Limpieza facial", status: "pending" }
  ],
  6: []
};

const startDate = new Date();
startDate.setHours(12, 0, 0, 0);
let selectedDate = new Date(startDate);
let selectedProfessional = "all";

const calendarGrid = document.querySelector("#calendar-grid");
const dateHeading = document.querySelector("#calendar-date");
const dialog = document.querySelector("#booking-dialog");
const dialogDetails = document.querySelector("#dialog-details");

function timeToSlot(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return ((hours - 9) * 2) + (minutes >= 30 ? 1 : 0) + 2;
}

function appointmentTime(appointment) {
  const hour = Number(appointment.start.slice(0, 2));
  const minute = Number(appointment.start.slice(3));
  const end = hour * 60 + minute + appointment.duration;
  return `${appointment.start}–${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderCalendar() {
  const dateText = new Intl.DateTimeFormat("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(selectedDate);
  dateHeading.textContent = dateText;
  calendarGrid.replaceChildren();

  const axis = makeElement("div", "time-axis");
  axis.append(makeElement("div"));
  for (let hour = 9; hour <= 16; hour += 1) {
    const label = makeElement("span", "time-axis-label", `${String(hour).padStart(2, "0")}:00`);
    label.style.gridRow = `${(hour - 9) * 2 + 2} / span 2`;
    axis.append(label);
  }
  calendarGrid.append(axis);

  const dayAppointments = sampleAppointments[selectedDate.getDay()] || [];
  const visibleProfessionals = selectedProfessional === "all"
    ? professionals
    : professionals.filter((professional) => professional.id === selectedProfessional);

  visibleProfessionals.forEach((professional) => {
    const column = makeElement("section", "professional-column");
    column.dataset.professional = professional.id;
    column.setAttribute("aria-label", `Agenda de ${professional.name}`);
    const heading = makeElement("div", "professional-heading");
    heading.style.gridRow = "1";
    heading.append(
      makeElement("span", "professional-avatar", professional.initial),
      makeElement("span", "", professional.name)
    );
    column.append(heading);

    dayAppointments
      .filter((appointment) => appointment.professional === professional.id)
      .forEach((appointment) => {
        const event = makeElement("button", "schedule-event");
        event.type = "button";
        event.dataset.state = appointment.status;
        const slot = timeToSlot(appointment.start);
        const durationSlots = Math.max(2, Math.ceil(appointment.duration / 30));
        event.style.gridRow = `${slot} / span ${durationSlots}`;
        event.title = `Ver turno de ${appointment.client}`;
        event.append(
          makeElement("strong", "", appointment.client),
          makeElement("span", "", `${appointment.start} · ${appointment.service}`)
        );
        event.addEventListener("click", () => showAppointment(appointment));
        column.append(event);
      });
    calendarGrid.append(column);
  });

  if (dayAppointments.length === 0 || !visibleProfessionals.some((professional) =>
    dayAppointments.some((appointment) => appointment.professional === professional.id)
  )) {
    const empty = makeElement("p", "empty-day", "No hay turnos de ejemplo para este día.");
    empty.style.gridColumn = `2 / span ${visibleProfessionals.length}`;
    calendarGrid.append(empty);
  }
}

function showAppointment(appointment) {
  const professional = professionals.find((item) => item.id === appointment.professional);
  const status = appointment.status === "pending" ? "Pendiente de aprobación" : "Confirmado";
  const fields = [
    ["Cliente", appointment.client],
    ["Servicio", appointment.service],
    ["Horario", appointmentTime(appointment)],
    ["Profesional", professional.name],
    ["Estado", status],
    ["Fecha", new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long" }).format(selectedDate)]
  ];
  dialogDetails.replaceChildren(...fields.map(([label, value]) => {
    const field = makeElement("div", "dialog-field");
    field.append(makeElement("span", "", label), makeElement("strong", "", value));
    return field;
  }));
  dialog.showModal();
}

document.querySelector("#previous-day").addEventListener("click", () => {
  selectedDate.setDate(selectedDate.getDate() - 1);
  renderCalendar();
});
document.querySelector("#next-day").addEventListener("click", () => {
  selectedDate.setDate(selectedDate.getDate() + 1);
  renderCalendar();
});
document.querySelector("#today-button").addEventListener("click", () => {
  selectedDate = new Date(startDate);
  renderCalendar();
});
document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    selectedProfessional = button.dataset.professional;
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      const active = chip === button;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    renderCalendar();
  });
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

renderCalendar();
