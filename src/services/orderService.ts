import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Linking } from 'react-native';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  retailerId: string;
  retailerName: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface Order {
  id?: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: 'whatsapp_cod' | 'online';
  retailerWhatsapp?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Generate unique order number
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SVA${timestamp}${random}`;
};

// Create a new order
export const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
  try {
    const orderNumber = generateOrderNumber();
    const newOrder = {
      ...orderData,
      orderNumber,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    console.log('✅ Order created with ID:', docRef.id);
    
    return {
      ...newOrder,
      id: docRef.id,
    };
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
};

// Get orders by user ID
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  try {
    console.log('Fetching orders for user:', userId);
    
    // Try with ordering first
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as Order);
      });
      
      console.log(`Found ${orders.length} orders for user`);
      return orders;
    } catch (indexError: any) {
      // Fallback without ordering if index doesn't exist
      console.log('Using simple query for orders');
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as Order);
      });
      
      // Sort manually
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return orders;
    }
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return [];
  }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Order;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    return null;
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string, 
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    await updateDoc(orderRef, updateData);
    console.log('✅ Order status updated');
  } catch (error) {
    console.error('❌ Error updating order:', error);
    throw error;
  }
};

// Format order for WhatsApp message
export const formatOrderForWhatsApp = (order: Order): string => {
  const itemsList = order.items
    .map((item, index) => `${index + 1}. ${item.productName} x${item.quantity} - ₹${item.price * item.quantity}`)
    .join('\n');

  const address = order.deliveryAddress;
  const fullAddress = [
    address.addressLine1,
    address.addressLine2,
    address.landmark ? `Near ${address.landmark}` : '',
    `${address.city}, ${address.state} - ${address.pincode}`,
  ].filter(Boolean).join('\n');

  const message = `🌾 *SVA AgroMart - New Order*\n\n` +
    `📦 *Order Number:* ${order.orderNumber}\n\n` +
    `👤 *Customer Details:*\n` +
    `Name: ${address.fullName}\n` +
    `Phone: ${address.phone}\n\n` +
    `📍 *Delivery Address:*\n${fullAddress}\n\n` +
    `🛒 *Order Items:*\n${itemsList}\n\n` +
    `💰 *Total Amount:* ₹${order.totalAmount}\n\n` +
    `💳 *Payment Method:* Cash on Delivery\n\n` +
    `${order.notes ? `📝 *Notes:* ${order.notes}\n\n` : ''}` +
    `Thank you for ordering from SVA AgroMart! 🙏`;

  return encodeURIComponent(message);
};

// Open WhatsApp with order details
export const sendOrderToWhatsApp = async (order: Order, whatsappNumber: string): Promise<boolean> => {
  try {
    // Format phone number (remove spaces and special characters)
    let formattedNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
    
    // Remove leading + if present
    if (formattedNumber.startsWith('+')) {
      formattedNumber = formattedNumber.substring(1);
    }
    
    // If number starts with 0, remove it
    if (formattedNumber.startsWith('0')) {
      formattedNumber = formattedNumber.substring(1);
    }
    
    // Only add 91 if it's exactly 10 digits (Indian mobile number without country code)
    if (formattedNumber.length === 10 && !formattedNumber.startsWith('91')) {
      formattedNumber = '91' + formattedNumber;
    }
    
    // If number already has 91 prefix and is 12 digits, it's already correct
    // Don't add 91 again

    console.log('📱 WhatsApp number:', formattedNumber);

    const message = formatOrderForWhatsApp(order);
    const whatsappUrl = `whatsapp://send?phone=${formattedNumber}&text=${message}`;
    
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return true;
    } else {
      // Try web WhatsApp as fallback
      const webUrl = `https://wa.me/${formattedNumber}?text=${message}`;
      await Linking.openURL(webUrl);
      return true;
    }
  } catch (error) {
    console.error('❌ Error opening WhatsApp:', error);
    return false;
  }
};

// Get orders for retailer
// Shows all orders where items have this retailerId, OR if retailerId is 'unknown' (legacy products)
export const getOrdersForRetailer = async (retailerId: string): Promise<Order[]> => {
  try {
    const allOrdersQuery = query(collection(db, 'orders'));
    const querySnapshot = await getDocs(allOrdersQuery);
    
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if any item in the order belongs to this retailer
      // Also include orders with 'unknown' retailerId (legacy/fallback products)
      const hasRetailerItems = data.items?.some((item: OrderItem) => 
        item.retailerId === retailerId || item.retailerId === 'unknown' || !item.retailerId
      );
      
      if (hasRetailerItems) {
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as Order);
      }
    });
    
    // Sort by date
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return orders;
  } catch (error) {
    console.error('Error fetching retailer orders:', error);
    return [];
  }
};
