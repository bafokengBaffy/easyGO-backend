module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'The ID of the admin who performed the action'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g., CREATE_PROMOTION, UPDATE_USER'
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'The entity being affected (e.g., users, promotions)'
    },
    resource_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'The ID of the affected resource'
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Snapshot of the changes or request body'
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'audit_logs',
    underscored: true,
    timestamps: true,
    updatedAt: false // Audit logs are immutable
  });

  return AuditLog;
};