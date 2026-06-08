
export interface ReservationFormValues {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  date?: Date;
  time: string;
  guests: number;
  menuId: string;
  specialRequests: string;
}

export interface ReservationFormProps {
  restaurantId: string;
  onSuccess?: () => void;
  buttonText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingReservation?: any; // Support for the TableReservation type
}
