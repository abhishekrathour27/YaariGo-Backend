import Notification from "../model/notification.js";
import response from "../utils/responseHandler.js";

const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return response(res, 401, "Unauthorized: No user ID found");
    }

    const notifications = await Notification.find({
      recipient: userId,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username profilePicture")
      .populate("recipient", "username profilePicture");

    return response(
      res,
      200,
      "Notifications fetched successfully",
      notifications
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return response(
      res,
      500,
      "Failed to fetch notifications",
      error.message
    );
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return response(res, 400, "Invalid notification ID");
    }

    const deletedNotification =
      await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return response(res, 404, "Notification not found");
    }

    return response(
      res,
      200,
      "Notification deleted successfully"
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    return response(
      res,
      500,
      "Failed to delete notification",
      error.message
    );
  }
};

export { getAllNotifications, deleteNotification };