// controllers/tenantController.js
import Tenant from "../models/Tenant.js";

const upgradeTenant = async (req, res) => {
    try {
        const { slug } = req.params;

        // Ensure admin can only upgrade their own tenant
        if (req.user.tenantId !== slug) {
            return res
                .status(403)
                .json({ error: "Cannot upgrade other tenants" });
        }

        const tenant = await Tenant.findOneAndUpdate(
            { slug },
            {
                subscription: "pro",
                noteLimit: -1, // Unlimited
            },
            { new: true }
        );

        if (!tenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }

        res.json({ message: "Subscription upgraded to Pro", tenant });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export { upgradeTenant };
